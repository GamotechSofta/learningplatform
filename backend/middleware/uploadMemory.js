import multer from "multer";

const storage = multer.memoryStorage();

// Small images (thumbnails, category/course art) are uploaded through the API.
// Large video files are NOT — they go straight to S3 via presigned multipart URLs.
export const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});
