import Course from "../models/course.js";
import Category from "../models/category.js";
import Video from "../models/video.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {
  resolveCourseContent,
  resolveCourseContentDirect,
} from "../utils/courseContentResolver.js";
import { resolveMediaUrl } from "../utils/mediaUrl.js";
import { applyCourseAccess, isPaidCourse } from "../utils/courseAccess.js";
import {
  annotateCoursesWithPlayableMedia,
  courseDataHasPlayableVideos,
  filterUnplayableVideosFromCourseData,
} from "../utils/coursePlayability.js";
import {
  applyCourseThumbnailFallbacks,
  attachFallbackThumbnails,
  pickVideoThumbnail,
  pickVideoUrl,
  pickHlsUrl,
} from "../utils/courseThumbnail.js";

const enrichCourseMedia = (courseData) => {
  for (const lesson of courseData.lessons || []) {
    lesson.videos = (lesson.videos || []).map((video) => ({
      ...video,
      videoUrl: pickVideoUrl(video),
      hlsUrl: pickHlsUrl(video),
      thumbnail: pickVideoThumbnail(video),
    }));
  }

  return applyCourseThumbnailFallbacks(courseData);
};

const attachVideoCounts = async (courses) => {
  if (!courses.length) return courses;

  const courseIds = courses.map((course) => course._id);
  const counts = await Video.aggregate([
    {
      $lookup: {
        from: "lessons",
        localField: "lesson",
        foreignField: "_id",
        as: "lessonDoc",
      },
    },
    { $unwind: "$lessonDoc" },
    {
      $match: {
        "lessonDoc.course": { $in: courseIds },
        isPublished: true,
        mediaValid: { $ne: false },
        $or: [
          { videoKey: { $exists: true, $nin: [null, ""] } },
          { externalUrl: { $exists: true, $nin: [null, ""] } },
          { hlsKey: { $exists: true, $nin: [null, ""] } },
        ],
      },
    },
    {
      $group: {
        _id: "$lessonDoc.course",
        videoCount: { $sum: 1 },
      },
    },
  ]);

  const countMap = Object.fromEntries(
    counts.map((row) => [row._id.toString(), row.videoCount])
  );

  return courses.map((course) => ({
    ...course,
    videoCount: countMap[course._id.toString()] || 0,
  }));
};

const mapCourseList = async (courses) => {
  const mapped = courses.map((course) => {
    const data = course.toObject ? course.toObject() : { ...course };
    data.isPaid = isPaidCourse(data);
    return data;
  });

  return attachFallbackThumbnails(mapped);
};

export const createCourse = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.body.category);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const course = await Course.create(req.body);
  const populated = await Course.findById(course._id)
    .populate("instructor", "name email")
    .populate("category", "name slug");

  res.status(201).json({ success: true, data: populated });
});

export const getCoursesVideoCounts = asyncHandler(async (req, res) => {
  const videoCounts = await Video.aggregate([
    {
      $lookup: {
        from: "lessons",
        localField: "lesson",
        foreignField: "_id",
        as: "lessonDoc",
      },
    },
    { $unwind: "$lessonDoc" },
    {
      $group: {
        _id: "$lessonDoc.course",
        videosCount: { $sum: 1 },
      },
    },
  ]);

  const countMap = Object.fromEntries(
    videoCounts.map((item) => [item._id.toString(), item.videosCount])
  );

  const courses = await Course.find()
    .populate("category", "name slug")
    .sort({ createdAt: -1 });

  const data = courses.map((course) => ({
    _id: course._id,
    title: course.title,
    category: course.category,
    isPublished: course.isPublished,
    videosCount: countMap[course._id.toString()] || 0,
  }));

  const totalVideos = data.reduce((sum, course) => sum + course.videosCount, 0);

  res.json({
    success: true,
    count: data.length,
    totalVideos,
    data,
  });
});

export const getCourses = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.published === "true") filter.isPublished = true;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.level) filter.level = req.query.level;

  const courses = await Course.find(filter)
    .populate("instructor", "name email")
    .populate("category", "name slug")
    .sort({ createdAt: -1 });

  const mapped = await mapCourseList(courses);
  const withCounts = await attachVideoCounts(mapped);
  const annotated =
    req.query.published === "true"
      ? await annotateCoursesWithPlayableMedia(withCounts)
      : withCounts;
  const data =
    req.query.published === "true"
      ? annotated.filter((course) => course.hasPlayableVideos !== false)
      : annotated;

  res.json({ success: true, count: data.length, data });
});

export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate("instructor", "name email")
    .populate("category", "name slug");

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const [data] = await mapCourseList([course]);
  res.json({ success: true, data });
});

export const getCourseBySlug = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug })
    .populate("instructor", "name email")
    .populate("category", "name slug");

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const [data] = await mapCourseList([course]);
  res.json({ success: true, data });
});

/**
 * Lightweight playback payload — avoids reloading the full course on every video tap.
 */
export const getVideoPlayback = asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const videoId = req.params.videoId;

  const video = await Video.findById(videoId).populate({
    path: "lesson",
    select: "title course",
    populate: { path: "course", select: "pricing title" },
  });

  if (!video || video.lesson?.course?._id?.toString() !== courseId) {
    res.status(404);
    throw new Error("Video not found in this course");
  }

  if (!video.isPublished) {
    res.status(404);
    throw new Error("Video is not published");
  }

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const courseData = course.toObject();
  courseData.lessons = [
    {
      _id: video.lesson._id,
      title: video.lesson.title,
      videos: [video.toObject()],
    },
  ];
  enrichCourseMedia(courseData);
  applyCourseAccess(courseData, req.user);

  const enriched = courseData.lessons[0].videos[0];
  const playbackUrl = pickVideoUrl(enriched);
  const hlsUrl = pickHlsUrl(enriched);

  res.json({
    success: true,
    data: {
      id: enriched._id?.toString(),
      title: enriched.title,
      lessonId: video.lesson._id?.toString(),
      lessonTitle: video.lesson.title,
      videoUrl: enriched.isLocked ? "" : playbackUrl,
      hlsUrl: enriched.isLocked ? "" : hlsUrl,
      thumbnail: enriched.thumbnail,
      duration: enriched.duration || 0,
      isLocked: enriched.isLocked === true,
      streamingStatus: enriched.streamingStatus || "pending",
    },
  });
});

export const getCourseWithLessons = asyncHandler(async (req, res) => {
  const publishedOnly = req.query.published === "true";

  const course = await Course.findById(req.params.id)
    .populate("instructor", "name email")
    .populate("category", "name slug");

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (publishedOnly && !course.isPublished) {
    res.status(404);
    throw new Error("Course not found");
  }

  const courseData = course.toObject();
  courseData.lessons = publishedOnly
    ? await resolveCourseContentDirect(course, { publishedOnly: true })
    : await resolveCourseContent(course, { publishedOnly: false });
  enrichCourseMedia(courseData);
  filterUnplayableVideosFromCourseData(courseData);
  courseData.hasPlayableVideos = courseDataHasPlayableVideos(courseData);
  courseData.isPaid = isPaidCourse(courseData);
  applyCourseAccess(courseData, req.user);

  res.json({ success: true, data: courseData });
});

export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }
  }

  Object.assign(course, req.body);
  await course.save();

  const updatedCourse = await Course.findById(course._id)
    .populate("instructor", "name email")
    .populate("category", "name slug");

  res.json({ success: true, data: updatedCourse });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  await course.deleteOne();
  res.json({ success: true, message: "Course removed" });
});
