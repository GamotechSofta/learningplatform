import path from "path";
import {
  S3Client,
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
let s3Client = null;

export const VIDEO_CHUNK_BYTES = 50 * 1024 * 1024;

const getBucket = () => {
  const bucket = process.env.AWS_BUCKET_NAME?.trim();
  if (!bucket) throw new Error("AWS_BUCKET_NAME is not configured");
  return bucket;
};

const getS3Client = () => {
  if (s3Client) return s3Client;

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const region = process.env.AWS_REGION?.trim();

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials are not configured");
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

export const UPLOAD_FOLDERS = {
  categoryImages: "images/categories",
  courseImages: "images/courses",
  videoImages: "images/videos",
  videos: "videos",
};

export const MAX_VIDEO_BYTES = 5 * 1024 * 1024 * 1024;

export const resolveImageFolder = (folder) => {
  const map = {
    categories: UPLOAD_FOLDERS.categoryImages,
    courses: UPLOAD_FOLDERS.courseImages,
    videos: UPLOAD_FOLDERS.videoImages,
  };
  return map[folder] || null;
};

export const buildS3Key = (folder, originalName) => {
  const ext = path.extname(originalName).toLowerCase() || "";
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${folder}/${unique}${ext}`;
};

export const getPublicUrl = (key) => {
  const base = (process.env.CLOUDFRONT_URL || "").replace(/\/$/, "");
  return `${base}/${key}`;
};

const resolveVideoContentType = (fileName, contentType) => {
  if (contentType?.startsWith("video/")) return contentType;
  const ext = path.extname(fileName).toLowerCase();
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

export const uploadImageToS3 = async (file, folder) => {
  const bucket = getBucket();
  const s3Folder = resolveImageFolder(folder);
  if (!s3Folder) {
    throw new Error("Invalid image folder. Use: categories, courses, or videos");
  }

  const key = buildS3Key(s3Folder, file.originalname);

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

export const initMultipartVideoUpload = async (fileName, contentType, fileSize) => {
  const bucket = getBucket();

  if (fileSize && fileSize > MAX_VIDEO_BYTES) {
    throw new Error("Video must be 5GB or smaller");
  }

  const key = buildS3Key(UPLOAD_FOLDERS.videos, fileName);
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
    videoUrl: getPublicUrl(key),
    contentType: resolvedType,
  };
};

export const uploadMultipartPartToS3 = async (key, uploadId, partNumber, body) => {
  const bucket = getBucket();

  const result = await getS3Client().send(
    new UploadPartCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: body,
    })
  );

  return { PartNumber: partNumber, ETag: result.ETag };
};

export const completeMultipartVideoUpload = async (key, uploadId, parts) => {
  const bucket = getBucket();

  await getS3Client().send(
    new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
          .map((part) => ({
            PartNumber: part.PartNumber,
            ETag: part.ETag,
          }))
          .sort((a, b) => a.PartNumber - b.PartNumber),
      },
    })
  );

  return { key, videoUrl: getPublicUrl(key) };
};

export const abortMultipartVideoUpload = async (key, uploadId) => {
  const bucket = getBucket();

  await getS3Client().send(
    new AbortMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
    })
  );
};
