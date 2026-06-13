import Category from "../models/category.js";
import Course from "../models/course.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { resolveCourseContent } from "../utils/courseContentResolver.js";
import { resolveMediaUrl } from "../utils/mediaUrl.js";
import {
  applyCourseThumbnailFallbacks,
  attachFallbackThumbnails,
  pickVideoThumbnail,
  pickVideoUrl,
} from "../utils/courseThumbnail.js";
import {
  courseDataHasVerifiedPlayableVideos,
  filterCoursesWithPlayableMedia,
  pruneUnverifiedVideosFromCourseData,
} from "../utils/coursePlayability.js";
import { isPaidCourse } from "../utils/courseAccess.js";

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

export const getCategories = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.published === "true") filter.isPublished = true;

  const categories = await Category.find(filter)
    .sort({ order: 1, name: 1 })
    .populate("coursesCount");

  const data = categories.map((category) => {
    const output = category.toObject();
    output.thumbnail = resolveMediaUrl(output.thumbnail);
    return output;
  });

  res.json({ success: true, count: data.length, data });
});

export const searchCategories = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q?.trim()) {
    res.status(400);
    throw new Error("Search query is required");
  }

  const term = q.trim();
  const regex = new RegExp(term, "i");

  let categories = await Category.find(
    { $text: { $search: term } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });

  if (categories.length === 0) {
    categories = await Category.find({
      $or: [{ name: regex }, { description: regex }, { slug: regex }],
    }).sort({ order: 1 });
  }

  const matchingCourses = await Course.find({
    $or: [{ title: regex }, { description: regex }, { slug: regex }],
  }).select("title slug thumbnail level isPublished category");

  const categoryIds = new Set([
    ...categories.map((c) => c._id.toString()),
    ...matchingCourses.map((c) => c.category?.toString()).filter(Boolean),
  ]);

  const results = await Category.find({ _id: { $in: [...categoryIds] } })
    .sort({ order: 1 })
    .populate("coursesCount")
    .populate({
      path: "courses",
      select: "title slug thumbnail level isPublished pricing",
      options: { sort: { createdAt: -1 } },
    });

  const data = [];
  for (const category of results) {
    const categoryData = category.toObject();
    const published = (categoryData.courses || []).filter((course) => course.isPublished);
    categoryData.courses = await filterCoursesWithPlayableMedia(published);
    data.push(categoryData);
  }

  res.json({ success: true, count: data.length, data });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate("coursesCount");

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.json({ success: true, data: category });
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).populate(
    "coursesCount"
  );

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.json({ success: true, data: category });
});

export const getCoursesByCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const filter = { category: category._id };
  if (req.query.published === "true") filter.isPublished = true;

  const courses = await Course.find(filter)
    .populate("instructor", "name email")
    .populate("category", "name slug")
    .sort({ createdAt: -1 });

  const withThumbs = await attachFallbackThumbnails(courses);
  const data =
    req.query.published === "true"
      ? await filterCoursesWithPlayableMedia(withThumbs)
      : withThumbs;
  res.json({ success: true, count: data.length, data });
});

export const getCategoryWithCourses = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate({
    path: "courses",
    options: { sort: { createdAt: -1 } },
    populate: { path: "instructor", select: "name email" },
  });

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.json({ success: true, data: category });
});

export const getCategoryFull = asyncHandler(async (req, res) => {
  const publishedOnly = req.query.published === "true";

  const category = await Category.findById(req.params.id).populate({
    path: "courses",
    options: { sort: { createdAt: -1 } },
    populate: { path: "instructor", select: "name email" },
  });

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const categoryData = category.toObject();
  const courses = [];

  for (const course of category.courses || []) {
    const courseData = course.toObject();
    courseData.lessons = await resolveCourseContent(course, { publishedOnly });
    for (const lesson of courseData.lessons || []) {
      lesson.videos = (lesson.videos || []).map((video) => ({
        ...video,
        videoUrl: pickVideoUrl(video),
        thumbnail: pickVideoThumbnail(video),
      }));
    }

    const enriched = applyCourseThumbnailFallbacks(courseData);
    await pruneUnverifiedVideosFromCourseData(enriched);

    const playable = await courseDataHasVerifiedPlayableVideos(enriched);
    if (!publishedOnly || playable) {
      enriched.isPaid = isPaidCourse(enriched);
      enriched.hasPlayableVideos = playable;
      if (playable) courses.push(enriched);
    }
  }

  categoryData.thumbnail = resolveMediaUrl(categoryData.thumbnail);
  categoryData.courses = courses;

  res.json({ success: true, data: categoryData });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  Object.assign(category, req.body);
  const updatedCategory = await category.save();

  res.json({ success: true, data: updatedCategory });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const courseCount = await Course.countDocuments({ category: category._id });
  if (courseCount > 0) {
    res.status(400);
    throw new Error("Cannot delete category with existing courses");
  }

  await category.deleteOne();
  res.json({ success: true, message: "Category removed" });
});
