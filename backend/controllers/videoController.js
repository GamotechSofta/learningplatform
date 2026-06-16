import Video from "../models/video.js";
import Lesson from "../models/lesson.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {
  createMultipartUpload,
  getUploadPartUrl,
  completeMultipartUpload,
  abortMultipartUpload,
  deleteFromS3,
  deleteObjectsByPrefix,
  readObjectRange,
  UPLOAD_FOLDERS,
  MAX_VIDEO_BYTES,
} from "../utils/s3.js";
import { looksLikeValidVideo } from "../utils/videoIntegrity.js";
import { queueVideoStreamingJob } from "../utils/videoStreaming.js";

// Only allow presigning/completing keys inside the videos/ prefix so a caller
// cannot get a signed URL for an arbitrary object in the bucket.
const assertVideoKey = (key, res) => {
  if (!key || !String(key).startsWith(`${UPLOAD_FOLDERS.videos}/`)) {
    res.status(400);
    throw new Error("Invalid or missing video key");
  }
};

/**
 * POST /api/videos/multipart/init
 * Body: { fileName, contentType, fileSize? }
 * Returns: { uploadId, key, partSize }
 */
export const initVideoMultipartUpload = asyncHandler(async (req, res) => {
  const { fileName, contentType, fileSize } = req.body;

  if (!fileName) {
    res.status(400);
    throw new Error("fileName is required");
  }

  if (fileSize && Number(fileSize) > MAX_VIDEO_BYTES) {
    res.status(400);
    throw new Error("Video must be 5GB or smaller");
  }

  const { uploadId, key, partSize } = await createMultipartUpload({
    fileName,
    contentType,
  });

  res.json({ success: true, data: { uploadId, key, partSize } });
});

/**
 * POST /api/videos/multipart/presign
 * Body: { uploadId, key, partNumber }
 * Returns: { url }
 */
export const presignVideoPart = asyncHandler(async (req, res) => {
  const { uploadId, key, partNumber } = req.body;

  assertVideoKey(key, res);

  if (!uploadId || !partNumber) {
    res.status(400);
    throw new Error("uploadId and partNumber are required");
  }

  const { url } = await getUploadPartUrl({ key, uploadId, partNumber });

  res.json({ success: true, data: { url } });
});

/**
 * POST /api/videos/multipart/complete
 * Body: { uploadId, key, parts: [{ ETag, PartNumber }] }
 * Returns: { videoKey, videoUrl }
 */
export const completeVideoMultipartUpload = asyncHandler(async (req, res) => {
  const { uploadId, key, parts } = req.body;

  assertVideoKey(key, res);

  if (!uploadId || !Array.isArray(parts) || parts.length === 0) {
    res.status(400);
    throw new Error("uploadId and a non-empty parts array are required");
  }

  const invalidPart = parts.some((p) => !p?.ETag || !p?.PartNumber);
  if (invalidPart) {
    res.status(400);
    throw new Error("Each part must include ETag and PartNumber");
  }

  const result = await completeMultipartUpload({ key, uploadId, parts });

  const header = await readObjectRange(key, 0, 65535);
  if (!looksLikeValidVideo(header)) {
    await deleteFromS3(key);
    res.status(400);
    throw new Error(
      "Uploaded file is not a valid video (corrupt or wrong format). Please re-upload the original MP4/WebM file."
    );
  }

  res.json({ success: true, data: result });
});

/**
 * POST /api/videos/multipart/abort
 * Body: { uploadId, key }
 */
export const abortVideoMultipartUpload = asyncHandler(async (req, res) => {
  const { uploadId, key } = req.body;

  assertVideoKey(key, res);

  if (!uploadId) {
    res.status(400);
    throw new Error("uploadId is required");
  }

  await abortMultipartUpload({ key, uploadId });

  res.json({ success: true, message: "Upload aborted" });
});

/**
 * POST /api/videos
 * Persist metadata after the file is already on S3.
 * Body: { lesson, title, description?, videoKey?, thumbnailKey?, externalUrl?, duration?, size?, order?, isPublished? }
 */
export const createVideo = asyncHandler(async (req, res) => {
  const {
    lesson: lessonId,
    title,
    description,
    videoKey,
    thumbnailKey,
    externalUrl,
    duration,
    size,
    order,
    isPublished,
  } = req.body;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  if (!title) {
    res.status(400);
    throw new Error("title is required");
  }

  if (!videoKey && !externalUrl) {
    res.status(400);
    throw new Error("videoKey (uploaded file) or externalUrl is required");
  }

  if (videoKey) {
    const header = await readObjectRange(videoKey, 0, 65535);
    if (!looksLikeValidVideo(header)) {
      res.status(400);
      throw new Error(
        "videoKey points to a corrupt or invalid file on S3. Re-upload the video before saving."
      );
    }
  }

  const existingCount = await Video.countDocuments({ lesson: lesson._id });

  const video = await Video.create({
    lesson: lesson._id,
    title,
    description: description || undefined,
    videoKey: videoKey || undefined,
    thumbnailKey: thumbnailKey || undefined,
    externalUrl: externalUrl || undefined,
    duration: Number(duration) || 0,
    size: Number(size) || 0,
    order: order ?? existingCount,
    isPublished: isPublished === true || isPublished === "true",
    streamingStatus: videoKey ? "pending" : "skipped",
  });

  if (videoKey) {
    queueVideoStreamingJob(video._id.toString());
  }

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

  const previousVideoKey = video.videoKey;
  const updatable = [
    "lesson",
    "title",
    "description",
    "videoKey",
    "thumbnailKey",
    "externalUrl",
    "duration",
    "size",
    "order",
    "isPublished",
  ];
  for (const field of updatable) {
    if (req.body[field] !== undefined) video[field] = req.body[field];
  }

  const updatedVideo = await video.save();

  if (
    req.body.videoKey &&
    req.body.videoKey !== previousVideoKey &&
    updatedVideo.videoKey
  ) {
    updatedVideo.streamingStatus = "pending";
    updatedVideo.hlsKey = undefined;
    await updatedVideo.save();
    queueVideoStreamingJob(updatedVideo._id.toString());
  }

  res.json({ success: true, data: updatedVideo });
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error("Video not found");
  }

  // Best-effort cleanup of S3 objects; never block the DB delete on this.
  const hlsPrefix = video.hlsKey
    ? video.hlsKey.replace(/\/master\.m3u8$/i, "")
    : null;

  await Promise.allSettled([
    video.videoKey ? deleteFromS3(video.videoKey) : Promise.resolve(),
    video.thumbnailKey ? deleteFromS3(video.thumbnailKey) : Promise.resolve(),
    hlsPrefix ? deleteObjectsByPrefix(hlsPrefix) : Promise.resolve(),
  ]);

  await video.deleteOne();
  res.json({ success: true, message: "Video removed" });
});
