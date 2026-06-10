import Video from "../models/video.js";
import Lesson from "../models/lesson.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {
  initMultipartVideoUpload,
  uploadMultipartPartToS3,
  completeMultipartVideoUpload,
  abortMultipartVideoUpload,
} from "../utils/s3.js";

export const initVideoMultipartUpload = asyncHandler(async (req, res) => {
  const { fileName, contentType, fileSize } = req.body;

  if (!fileName) {
    res.status(400);
    throw new Error("fileName is required");
  }

  const result = await initMultipartVideoUpload(fileName, contentType, fileSize);

  res.json({ success: true, data: result });
});

export const uploadVideoMultipartPart = asyncHandler(async (req, res) => {
  const { key, uploadId, partNumber } = req.body;

  if (!key || !uploadId || !partNumber) {
    res.status(400);
    throw new Error("key, uploadId, and partNumber are required");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("No video chunk uploaded");
  }

  const result = await uploadMultipartPartToS3(
    key,
    uploadId,
    Number(partNumber),
    req.file.buffer
  );

  res.json({ success: true, data: result });
});

export const completeVideoMultipartUpload = asyncHandler(async (req, res) => {
  const { key, uploadId, parts } = req.body;

  if (!key || !uploadId || !parts?.length) {
    res.status(400);
    throw new Error("key, uploadId, and parts are required");
  }

  const result = await completeMultipartVideoUpload(key, uploadId, parts);

  res.json({ success: true, data: result });
});

export const abortVideoMultipartUpload = asyncHandler(async (req, res) => {
  const { key, uploadId } = req.body;

  if (!key || !uploadId) {
    res.status(400);
    throw new Error("key and uploadId are required");
  }

  await abortMultipartVideoUpload(key, uploadId);

  res.json({ success: true, message: "Upload aborted" });
});

export const createVideo = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.body.lesson);

  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  const existingCount = await Video.countDocuments({ lesson: lesson._id });
  const order = req.body.order ?? existingCount;

  const video = await Video.create({ ...req.body, order });
  res.status(201).json({ success: true, data: video });
});

export const getVideos = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.lesson) filter.lesson = req.query.lesson;
  if (req.query.published === "true") filter.isPublished = true;

  const videos = await Video.find(filter).sort({ order: 1 });

  res.json({ success: true, count: videos.length, data: videos });
});

export const getVideosByLesson = asyncHandler(async (req, res) => {
  const videos = await Video.find({ lesson: req.params.lessonId }).sort({
    order: 1,
  });

  res.json({ success: true, count: videos.length, data: videos });
});

export const getVideoById = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate({
    path: "lesson",
    select: "title course",
    populate: { path: "course", select: "title slug" },
  });

  if (!video) {
    res.status(404);
    throw new Error("Video not found");
  }

  res.json({ success: true, data: video });
});

export const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error("Video not found");
  }

  if (req.body.lesson) {
    const lesson = await Lesson.findById(req.body.lesson);
    if (!lesson) {
      res.status(404);
      throw new Error("Lesson not found");
    }
  }

  Object.assign(video, req.body);
  const updatedVideo = await video.save();

  res.json({ success: true, data: updatedVideo });
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error("Video not found");
  }

  await video.deleteOne();
  res.json({ success: true, message: "Video removed" });
});
