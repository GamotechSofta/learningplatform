import Lesson from "../models/lesson.js";
import Video from "../models/video.js";
import { readObjectRange } from "./s3.js";
import { looksLikeValidVideo } from "./videoIntegrity.js";

const integrityCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

export const isPlayableVideoDoc = (video) => {
  if (!video) return false;
  if (video.mediaValid === false) return false;
  return Boolean(video.videoKey || video.externalUrl || video.videoUrl);
};

const cacheIntegrity = (key, valid) => {
  integrityCache.set(key, { valid, at: Date.now() });
};

const readCachedIntegrity = (key) => {
  const cached = integrityCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.at > CACHE_TTL_MS) {
    integrityCache.delete(key);
    return null;
  }
  return cached.valid;
};

/**
 * Verify an uploaded S3 object is a real video (not corrupt filler).
 * Persists mediaValid=false in Mongo when corrupt.
 */
export const verifyVideoFileIntegrity = async (video) => {
  if (!video) return false;
  if (video.mediaValid === false) return false;

  if (!video.videoKey) {
    return Boolean(video.externalUrl || video.videoUrl);
  }

  const cached = readCachedIntegrity(video.videoKey);
  if (cached !== null) return cached;

  try {
    const header = await readObjectRange(video.videoKey, 0, 65535);
    const valid = looksLikeValidVideo(header);
    cacheIntegrity(video.videoKey, valid);

    if (!valid && video._id) {
      await Video.updateOne({ _id: video._id }, { $set: { mediaValid: false } });
    }

    return valid;
  } catch {
    cacheIntegrity(video.videoKey, false);
    if (video._id) {
      await Video.updateOne({ _id: video._id }, { $set: { mediaValid: false } }).catch(() => {});
    }
    return false;
  }
};

export const courseDataHasPlayableVideos = (courseData) => {
  for (const lesson of courseData?.lessons || []) {
    for (const video of lesson.videos || []) {
      if (isPlayableVideoDoc(video)) return true;
    }
  }
  return false;
};

export const courseDataHasVerifiedPlayableVideos = async (courseData) => {
  for (const lesson of courseData?.lessons || []) {
    for (const video of lesson.videos || []) {
      if (!isPlayableVideoDoc(video)) continue;
      if (await verifyVideoFileIntegrity(video)) return true;
    }
  }
  return false;
};

export const pruneUnverifiedVideosFromCourseData = async (courseData) => {
  for (const lesson of courseData?.lessons || []) {
    const kept = [];
    for (const video of lesson.videos || []) {
      if (!isPlayableVideoDoc(video)) continue;
      if (await verifyVideoFileIntegrity(video)) kept.push(video);
    }
    lesson.videos = kept;
  }
  return courseData;
};

/**
 * Course IDs with at least one published video that passes S3 integrity checks.
 */
export const getPlayableCourseIdSet = async (courseIds) => {
  if (!courseIds?.length) return new Set();

  const lessons = await Lesson.find({ course: { $in: courseIds } })
    .select("_id course")
    .lean();

  if (!lessons.length) return new Set();

  const lessonToCourse = Object.fromEntries(
    lessons.map((lesson) => [lesson._id.toString(), lesson.course.toString()])
  );

  const videos = await Video.find({
    lesson: { $in: lessons.map((lesson) => lesson._id) },
    isPublished: true,
    $or: [
      { videoKey: { $exists: true, $nin: [null, ""] } },
      { externalUrl: { $exists: true, $nin: [null, ""] } },
    ],
  })
    .select("_id lesson videoKey externalUrl mediaValid")
    .sort({ order: 1 })
    .lean();

  const videosByCourse = new Map();
  for (const video of videos) {
    const courseId = lessonToCourse[video.lesson.toString()];
    if (!courseId) continue;
    if (!videosByCourse.has(courseId)) videosByCourse.set(courseId, []);
    videosByCourse.get(courseId).push(video);
  }

  const playable = new Set();

  await Promise.all(
    [...videosByCourse.entries()].map(async ([courseId, courseVideos]) => {
      for (const video of courseVideos) {
        if (await verifyVideoFileIntegrity(video)) {
          playable.add(courseId);
          return;
        }
      }
    })
  );

  return playable;
};

export const filterCoursesWithPlayableMedia = async (courses) => {
  const list = courses.map((course) =>
    course?.toObject ? course.toObject() : { ...course }
  );
  if (!list.length) return [];

  const playableIds = await getPlayableCourseIdSet(list.map((course) => course._id));

  return list
    .filter((course) => playableIds.has(course._id.toString()))
    .map((course) => ({ ...course, hasPlayableVideos: true }));
};
