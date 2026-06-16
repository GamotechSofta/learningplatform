import Category from "../models/category.js";
import Course from "../models/course.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { resolveMediaUrl } from "../utils/mediaUrl.js";
import { attachFallbackThumbnails } from "../utils/courseThumbnail.js";
import { annotateCoursesWithPlayableMedia, getPlayableCourseIdSet } from "../utils/coursePlayability.js";
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

  const publishedOnly = req.query.published === "true";
  let publishedCountMap = null;

  if (publishedOnly && categories.length > 0) {
    const categoryIds = categories.map((category) => category._id);
    const publishedCourses = await Course.find({
      category: { $in: categoryIds },
      isPublished: true,
    })
      .select("_id category")
      .lean();

    const playableIds = await getPlayableCourseIdSet(
      publishedCourses.map((course) => course._id)
    );

    publishedCountMap = {};
    for (const course of publishedCourses) {
      if (!playableIds.has(course._id.toString())) continue;
      const catId = course.category.toString();
      publishedCountMap[catId] = (publishedCountMap[catId] || 0) + 1;
    }
  }

  const data = categories.map((category) => {
    const output = category.toObject();
    output.thumbnail = resolveMediaUrl(output.thumbnail);
    if (publishedCountMap) {
      output.coursesCount = publishedCountMap[category._id.toString()] || 0;
    }
    return output;
  });

  res.json({ success: true, count: data.length, data });
});

export const searchCategories = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const publishedOnly = req.query.published === "true";

  if (!q?.trim()) {
    res.status(400);
    throw new Error("Search query is required");
  }

  const term = q.trim();
  const regex = new RegExp(term, "i");

  const categoryFilter = publishedOnly ? { isPublished: true } : {};

  let categories = await Category.find(
    { ...categoryFilter, $text: { $search: term } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });

  if (categories.length === 0) {
    categories = await Category.find({
      ...categoryFilter,
      $or: [{ name: regex }, { description: regex }, { slug: regex }],
    }).sort({ order: 1 });
  }

  const courseFilter = {
    $or: [{ title: regex }, { description: regex }, { slug: regex }],
  };
  if (publishedOnly) courseFilter.isPublished = true;

  const matchingCourses = await Course.find(courseFilter).select(
    "title slug thumbnail level isPublished category"
  );

  const categoryIds = new Set([
    ...categories.map((c) => c._id.toString()),
    ...matchingCourses.map((c) => c.category?.toString()).filter(Boolean),
  ]);

  const results = await Category.find({
    _id: { $in: [...categoryIds] },
    ...(publishedOnly ? { isPublished: true } : {}),
  })
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
    let courses = categoryData.courses || [];
    if (publishedOnly) {
      courses = courses.filter((course) => course.isPublished);
    }
    const annotated = publishedOnly
      ? await annotateCoursesWithPlayableMedia(courses)
      : courses;
    categoryData.courses = publishedOnly
      ? annotated.filter((course) => course.hasPlayableVideos !== false)
      : annotated;
    if (publishedOnly && categoryData.courses.length === 0) continue;
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
  const annotated =
    req.query.published === "true"
      ? await annotateCoursesWithPlayableMedia(withThumbs)
      : withThumbs;
  const data =
    req.query.published === "true"
      ? annotated.filter((course) => course.hasPlayableVideos !== false)
      : annotated;
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
    populate: [
      { path: "instructor", select: "name email" },
      { path: "category", select: "name slug" },
    ],
  });

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const categoryData = category.toObject();
  let courses = (categoryData.courses || []).map((course) => ({
    ...course,
    isPaid: isPaidCourse(course),
  }));

  if (publishedOnly) {
    courses = courses.filter((course) => course.isPublished);
  }

  const withThumbs = await attachFallbackThumbnails(courses);
  categoryData.thumbnail = resolveMediaUrl(categoryData.thumbnail);
  const annotated = publishedOnly
    ? await annotateCoursesWithPlayableMedia(withThumbs)
    : withThumbs;
  categoryData.courses = publishedOnly
    ? annotated.filter((course) => course.hasPlayableVideos !== false)
    : annotated;
  if (publishedOnly) {
    categoryData.coursesCount = categoryData.courses.length;
  }

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
