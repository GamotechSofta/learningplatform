import Lesson from "../models/lesson.js";
import Video from "../models/video.js";
import Course from "../models/course.js";

const STOP_WORDS = new Set([
  "for",
  "the",
  "and",
  "with",
  "from",
  "course",
  "full",
  "beginner",
  "beginners",
  "master",
  "mastery",
  "basic",
  "advanced",
  "no",
  "coding",
]);

export const videoHasUsableMedia = (video) => {
  const doc = video?.toObject ? video.toObject() : video;
  if (doc?.mediaValid === false) return false;
  return Boolean(doc?.videoKey || doc?.externalUrl || doc?.hlsKey || doc?.videoUrl);
};

const hasPlayableVideo = (video) => videoHasUsableMedia(video);

const includeVideo = (video, publishedOnly) => {
  if (!hasPlayableVideo(video)) return false;
  if (publishedOnly && !video.isPublished) return false;
  return true;
};

const includeLesson = (lesson, videos, publishedOnly) => {
  if (videos.length > 0) return true;
  if (publishedOnly) return lesson.isPublished;
  return false;
};

const videoSearchText = (video) => {
  const doc = video?.toObject ? video.toObject() : video;
  return `${doc?.title || ""} ${doc?.videoKey || ""}`.toLowerCase();
};

const courseKeywords = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

const videoMatchesCourse = (video, courseTitle) => {
  const text = videoSearchText(video);
  const title = courseTitle.toLowerCase();

  if (/java for beginners|\bjava\b/.test(title) && /\bjava\b/.test(text)) return true;
  if (/wordpress|wordrpress/.test(title) && /wordpress|wordrpress/.test(text)) return true;
  const iotPattern = /internet of things|\biot\b/i;
  if (iotPattern.test(title) && iotPattern.test(text)) {
    return true;
  }
  if (/aws/.test(title) && /devops/.test(title) && /\baws\b/.test(text)) return true;

  const keywords = courseKeywords(courseTitle);
  if (keywords.length === 0) return false;

  const hits = keywords.filter((word) => text.includes(word));
  if (keywords.length === 1) return hits.length === 1;
  return hits.length >= Math.min(2, keywords.length);
};

const coursesAreRelated = (primaryTitle, otherTitle) => {
  const a = courseKeywords(primaryTitle);
  const b = courseKeywords(otherTitle);
  if (!a.length || !b.length) return false;

  const overlap = a.filter((word) => b.includes(word));
  return overlap.length >= Math.min(2, a.length, b.length);
};

const getRelatedCourseIds = async (course) => {
  const categoryId = course.category?._id ?? course.category;
  const related = await Course.find({ _id: { $ne: course._id } })
    .select("_id title category")
    .lean();

  return related.filter((entry) => {
    if (entry.category?.toString() === categoryId?.toString()) return true;
    return coursesAreRelated(course.title, entry.title);
  });
};

const findOrphanVideos = async (validLessonIds) => {
  const allVideos = await Video.find().sort({ order: 1 });
  return allVideos.filter((video) => {
    if (!includeVideo(video, false)) return false;
    if (!video.lesson) return true;
    return !validLessonIds.has(video.lesson.toString());
  });
};

/**
 * Admin-style resolver: only this course's lessons and their linked videos.
 * Used for mobile/public catalog so content matches the admin curriculum view.
 */
export const resolveCourseContentDirect = async (course, { publishedOnly = false } = {}) => {
  const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 });
  if (!lessons.length) return [];

  const videoFilter = { lesson: { $in: lessons.map((lesson) => lesson._id) } };
  if (publishedOnly) videoFilter.isPublished = true;

  const videos = await Video.find(videoFilter).sort({ order: 1 });
  const videosByLessonId = new Map();

  for (const video of videos) {
    if (!hasPlayableVideo(video)) continue;
    const key = video.lesson.toString();
    if (!videosByLessonId.has(key)) videosByLessonId.set(key, []);
    videosByLessonId.get(key).push(video.toObject());
  }

  const resolvedLessons = [];
  for (const lesson of lessons) {
    const lessonVideos = videosByLessonId.get(lesson._id.toString()) || [];
    if (publishedOnly && lessonVideos.length === 0) continue;
    if (!publishedOnly && lessonVideos.length === 0 && !lesson.isPublished) continue;

    resolvedLessons.push({
      ...lesson.toObject(),
      videos: lessonVideos,
    });
  }

  return resolvedLessons;
};

/**
 * Resolve a course's lesson/video tree using own lessons, title-matched
 * sibling content, related courses (e.g. AWS DevOps variants), and orphans.
 */
export const resolveCourseContent = async (course, { publishedOnly = false } = {}) => {
  const primaryCourseId = course._id.toString();
  const categoryId = course.category?._id ?? course.category;

  const categoryCourses = categoryId
    ? await Course.find({ category: categoryId }).select("_id title").lean()
    : [{ _id: course._id, title: course.title }];

  const relatedCourses = await getRelatedCourseIds(course);
  const courseMap = new Map();

  for (const entry of [...categoryCourses, ...relatedCourses, { _id: course._id, title: course.title }]) {
    courseMap.set(entry._id.toString(), entry);
  }

  const courseIds = [...courseMap.values()].map((entry) => entry._id);
  const courseTitleById = Object.fromEntries(
    [...courseMap.values()].map((entry) => [entry._id.toString(), entry.title])
  );

  const allLessons = await Lesson.find({ course: { $in: courseIds } }).sort({
    order: 1,
  });

  const lessonIds = allLessons.map((lesson) => lesson._id);
  const validLessonIds = new Set(lessonIds.map((id) => id.toString()));

  const allVideos = lessonIds.length
    ? await Video.find({ lesson: { $in: lessonIds } }).sort({ order: 1 })
    : [];

  const videosByLessonId = new Map();
  for (const video of allVideos) {
    if (!includeVideo(video, publishedOnly)) continue;
    const key = video.lesson.toString();
    if (!videosByLessonId.has(key)) videosByLessonId.set(key, []);
    videosByLessonId.get(key).push(video.toObject());
  }

  const primaryLessons = allLessons.filter(
    (lesson) => lesson.course.toString() === primaryCourseId
  );
  const otherLessons = allLessons.filter(
    (lesson) => lesson.course.toString() !== primaryCourseId
  );

  const usedVideoIds = new Set();
  const takeVideos = (lessonId, { courseTitle, filterByCourse = false } = {}) => {
    const picked = [];
    for (const video of videosByLessonId.get(lessonId.toString()) || []) {
      const id = video._id.toString();
      if (usedVideoIds.has(id)) continue;
      if (filterByCourse && courseTitle && !videoMatchesCourse(video, courseTitle)) continue;

      usedVideoIds.add(id);
      picked.push({ ...video, isPublished: true });
    }
    return picked;
  };

  const resolvedLessons = [];
  const primaryTitles = new Set();

  for (const lesson of primaryLessons) {
    const videos = takeVideos(lesson._id);

    for (const other of otherLessons) {
      if (other.title.toLowerCase() !== lesson.title.toLowerCase()) continue;
      videos.push(...takeVideos(other._id));
    }

    if (!includeLesson(lesson, videos, publishedOnly)) continue;

    primaryTitles.add(lesson.title.toLowerCase());
    resolvedLessons.push({
      ...lesson.toObject(),
      isPublished: true,
      videos,
    });
  }

  let supplementalOrder = resolvedLessons.length;

  for (const other of otherLessons) {
    if (primaryTitles.has(other.title.toLowerCase())) continue;

    const sourceCourseTitle = courseTitleById[other.course.toString()] || "";
    const videos = takeVideos(other._id, {
      courseTitle: course.title,
      filterByCourse: true,
    });

    if (videos.length === 0) continue;

    resolvedLessons.push({
      ...other.toObject(),
      title: `${sourceCourseTitle} — ${other.title}`,
      order: supplementalOrder,
      isPublished: true,
      videos,
    });
    supplementalOrder += 1;
  }

  const orphanVideos = await findOrphanVideos(validLessonIds);
  const matchedOrphans = orphanVideos.filter((video) =>
    videoMatchesCourse(video, course.title)
  );

  const orphanLessonVideos = [];
  for (const video of matchedOrphans) {
    if (!includeVideo(video, publishedOnly)) continue;
    const id = video._id.toString();
    if (usedVideoIds.has(id)) continue;
    usedVideoIds.add(id);
    orphanLessonVideos.push({ ...video.toObject(), isPublished: true });
  }

  if (orphanLessonVideos.length > 0) {
    resolvedLessons.push({
      _id: `matched-${primaryCourseId}`,
      course: course._id,
      title: `${course.title} — More Videos`,
      description: "Additional videos matched to this course.",
      order: supplementalOrder,
      isFree: true,
      isPublished: true,
      videos: orphanLessonVideos,
    });
  }

  resolvedLessons.sort((a, b) => a.order - b.order);
  return resolvedLessons;
};
