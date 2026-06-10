import Video from "../models/video.js";
import Lesson from "../models/lesson.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const uploadVideoFile = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.body.lesson);

  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("No video file uploaded");
  }

  const videoUrl = `${req.protocol}://${req.get("host")}/uploads/videos/${req.file.filename}`;
  const existingCount = await Video.countDocuments({ lesson: lesson._id });

  const video = await Video.create({
    lesson: req.body.lesson,
    title: req.body.title,
    description: req.body.description,
    videoUrl,
    thumbnail: req.body.thumbnail,
    duration: Number(req.body.duration) || 0,
    order: existingCount,
    isPublished: req.body.isPublished === "true",
  });

  res.status(201).json({ success: true, data: video });
});

export const createVideo = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.body.lesson);

  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  const video = await Video.create(req.body);
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
