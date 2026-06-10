import asyncHandler from "../middleware/asyncHandler.js";
import { uploadImageToS3 } from "../utils/s3.js";

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No image file uploaded");
  }

  const folder = req.body.folder;
  if (!folder) {
    res.status(400);
    throw new Error("folder is required (categories, courses, or videos)");
  }

  const result = await uploadImageToS3(req.file, folder);

  res.status(201).json({
    success: true,
    data: {
      url: result.url,
      key: result.key,
    },
  });
});
