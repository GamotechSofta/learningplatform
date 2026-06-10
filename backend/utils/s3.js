import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

let s3Client = null;

const getS3Client = () => {
  if (s3Client) return s3Client;

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const region = process.env.AWS_REGION?.trim();

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials are not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env");
  }

  if (!region) {
    throw new Error("AWS_REGION is not configured");
  }

  s3Client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  return s3Client;
};

export const UPLOAD_FOLDERS = {
  categoryImages: "images/categories",
  courseImages: "images/courses",
  videoImages: "images/videos",
  videos: "videos",
};

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

export const uploadImageToS3 = async (file, folder) => {
  const bucket = process.env.AWS_BUCKET_NAME?.trim();
  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME is not configured");
  }

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

export const uploadVideoToS3 = async (file) => {
  const bucket = process.env.AWS_BUCKET_NAME?.trim();
  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME is not configured");
  }

  const key = buildS3Key(UPLOAD_FOLDERS.videos, file.originalname);

  const upload = new Upload({
    client: getS3Client(),
    params: {
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    },
  });

  await upload.done();

  return { key, url: getPublicUrl(key) };
};
