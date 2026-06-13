import path from "path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// 25 MB per part (S3 requires every part except the last to be >= 5 MB)
export const VIDEO_PART_SIZE = 25 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB hard cap
const PRESIGN_EXPIRY_SECONDS = 60 * 60; // 1 hour

export const UPLOAD_FOLDERS = {
  categoryImages: "images/categories",
  courseImages: "images/courses",
  videoThumbnails: "thumbnails",
  videos: "videos",
};

let s3Client = null;

const getBucket = () => {
  const bucket = process.env.AWS_BUCKET_NAME?.trim();
  if (!bucket) throw new Error("AWS_BUCKET_NAME is not configured");
  return bucket;
};

/**
 * Single shared S3 client. Checksum calculation is forced to WHEN_REQUIRED so
 * presigned URLs do NOT include x-amz-checksum-* query params, which browsers
 * cannot reproduce on a direct PUT (would otherwise break direct uploads).
 */
const getS3Client = () => {
  if (s3Client) return s3Client;

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const region = process.env.AWS_REGION?.trim();

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials are not configured (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)");
  }
  if (!region) {
    throw new Error("AWS_REGION is not configured");
  }

  s3Client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  return s3Client;
};

/**
 * Base CloudFront URL. Prefers CDN_URL, falls back to legacy CLOUDFRONT_URL.
 */
export const getCdnBaseUrl = () => {
  const base = process.env.CDN_URL || process.env.CLOUDFRONT_URL || "";
  return base.replace(/\/+$/, "");
};

/**
 * Convert a stored S3 key into a public CloudFront URL.
 * Never expose raw S3 URLs to clients.
 */
export const getPublicUrl = (key) => {
  if (!key) return "";
  if (/^https?:\/\//i.test(key)) return key; // already an absolute (external) URL
  const base = getCdnBaseUrl();
  const normalizedKey = String(key).replace(/^\/+/, "");
  return base ? `${base}/${normalizedKey}` : `/${normalizedKey}`;
};

const slugifyBaseName = (fileName) => {
  const base = path.basename(fileName || "", path.extname(fileName || ""));
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "file";
};

export const buildVideoKey = (fileName) => {
  const ext = (path.extname(fileName || "").toLowerCase() || ".mp4");
  return `${UPLOAD_FOLDERS.videos}/${Date.now()}-${slugifyBaseName(fileName)}${ext}`;
};

export const resolveImageFolder = (folder) => {
  const map = {
    categories: UPLOAD_FOLDERS.categoryImages,
    courses: UPLOAD_FOLDERS.courseImages,
    videos: UPLOAD_FOLDERS.videoThumbnails,
    thumbnails: UPLOAD_FOLDERS.videoThumbnails,
  };
  return map[folder] || null;
};

export const buildImageKey = (folder, originalName) => {
  const ext = path.extname(originalName || "").toLowerCase() || "";
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${folder}/${unique}${ext}`;
};

const resolveVideoContentType = (fileName, contentType) => {
  if (contentType?.startsWith("video/")) return contentType;
  const ext = path.extname(fileName || "").toLowerCase();
  const map = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    ".mkv": "video/x-matroska",
    ".m4v": "video/x-m4v",
  };
  return map[ext] || "video/mp4";
};

/**
 * Small images (thumbnails) are still uploaded via the backend because they are
 * tiny. Returns the S3 key (store the key, build the URL on read).
 */
export const uploadImageToS3 = async (file, folder) => {
  const bucket = getBucket();
  const s3Folder = resolveImageFolder(folder);
  if (!s3Folder) {
    throw new Error("Invalid image folder. Use: categories, courses, videos, or thumbnails");
  }

  const key = buildImageKey(s3Folder, file.originalname);

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return { key, url: getPublicUrl(key) };
};

/* -------------------------------------------------------------------------- */
/*                       Multipart upload (video files)                       */
/* -------------------------------------------------------------------------- */

/**
 * Step 1 — create an S3 multipart upload session.
 * The browser will upload parts directly to S3; the file never touches us.
 */
export const createMultipartUpload = async ({ fileName, contentType }) => {
  const bucket = getBucket();
  const key = buildVideoKey(fileName);
  const resolvedType = resolveVideoContentType(fileName, contentType);

  const { UploadId } = await getS3Client().send(
    new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      ContentType: resolvedType,
    })
  );

  return {
    uploadId: UploadId,
    key,
    partSize: VIDEO_PART_SIZE,
    contentType: resolvedType,
  };
};

/**
 * Step 2 — presigned URL for a single UploadPart request.
 * The browser PUTs the chunk straight to this URL.
 */
export const getUploadPartUrl = async ({ key, uploadId, partNumber }) => {
  const bucket = getBucket();

  const command = new UploadPartCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    PartNumber: Number(partNumber),
  });

  const url = await getSignedUrl(getS3Client(), command, {
    expiresIn: PRESIGN_EXPIRY_SECONDS,
  });

  return { url };
};

/**
 * Step 3 — stitch the uploaded parts into the final object.
 */
export const completeMultipartUpload = async ({ key, uploadId, parts }) => {
  const bucket = getBucket();

  await getS3Client().send(
    new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
          .map((part) => ({
            PartNumber: Number(part.PartNumber),
            ETag: part.ETag,
          }))
          .sort((a, b) => a.PartNumber - b.PartNumber),
      },
    })
  );

  return { videoKey: key, videoUrl: getPublicUrl(key) };
};

/**
 * Cleanup — abort an incomplete multipart upload (cancel / unrecoverable error).
 * S3 keeps orphaned parts (and bills for them) until aborted.
 */
export const abortMultipartUpload = async ({ key, uploadId }) => {
  const bucket = getBucket();

  await getS3Client().send(
    new AbortMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
    })
  );
};

/**
 * Read a byte range from an S3 object (used to verify uploads).
 */
export const readObjectRange = async (key, start = 0, end = 65535) => {
  if (!key || /^https?:\/\//i.test(key)) {
    throw new Error("Invalid S3 key");
  }

  const bucket = getBucket();
  const response = await getS3Client().send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      Range: `bytes=${start}-${end}`,
    })
  );

  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

/**
 * Delete an object from S3 (used when a video record is removed).
 */
export const deleteFromS3 = async (key) => {
  if (!key || /^https?:\/\//i.test(key)) return;
  const bucket = getBucket();

  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
};
