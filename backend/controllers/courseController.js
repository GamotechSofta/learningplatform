import Course from "../models/course.js";
import Category from "../models/category.js";
import Video from "../models/video.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { resolveCourseContent } from "../utils/courseContentResolver.js";
import { resolveMediaUrl } from "../utils/mediaUrl.js";
import { applyCourseAccess, isPaidCourse } from "../utils/courseAccess.js";
import {
  courseDataHasVerifiedPlayableVideos,
  filterCoursesWithPlayableMedia,
  pruneUnverifiedVideosFromCourseData,
} from "../utils/coursePlayability.js";
import {
  applyCourseThumbnailFallbacks,
  attachFallbackThumbnails,
  pickVideoThumbnail,
  pickVideoUrl,
} from "../utils/courseThumbnail.js";

const enrichCourseMedia = (courseData) => {
  for (const lesson of courseData.lessons || []) {
    lesson.videos = (lesson.videos || []).map((video) => ({
      ...video,
      videoUrl: pickVideoUrl(video),
      thumbnail: pickVideoThumbnail(video),
    }));
  }

  return applyCourseThumbnailFallbacks(courseData);
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
  const data =
    req.query.published === "true"
      ? await filterCoursesWithPlayableMedia(mapped)
      : mapped;

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

export const getCourseWithLessons = asyncHandler(async (req, res) => {
  const publishedOnly = req.query.published === "true";

  const course = await Course.findById(req.params.id)
    .populate("instructor", "name email")
    .populate("category", "name slug");

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const courseData = course.toObject();
  courseData.lessons = await resolveCourseContent(course, { publishedOnly });
  enrichCourseMedia(courseData);
  await pruneUnverifiedVideosFromCourseData(courseData);

  if (!(await courseDataHasVerifiedPlayableVideos(courseData))) {
    res.status(404);
    throw new Error("Course videos are unavailable");
  }

  courseData.hasPlayableVideos = true;
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
