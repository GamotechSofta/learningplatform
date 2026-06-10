import Course from "../models/course.js";
import Category from "../models/category.js";
import asyncHandler from "../middleware/asyncHandler.js";

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

export const getCourses = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.published === "true") filter.isPublished = true;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.level) filter.level = req.query.level;

  const courses = await Course.find(filter)
    .populate("instructor", "name email")
    .populate("category", "name slug")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: courses.length, data: courses });
});

export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate("instructor", "name email")
    .populate("category", "name slug");

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  res.json({ success: true, data: course });
});

export const getCourseBySlug = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug })
    .populate("instructor", "name email")
    .populate("category", "name slug");

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  res.json({ success: true, data: course });
});

export const getCourseWithLessons = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate("instructor", "name email")
    .populate("category", "name slug")
    .populate({
      path: "lessons",
      options: { sort: { order: 1 } },
      populate: {
        path: "videos",
        options: { sort: { order: 1 } },
      },
    });

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  res.json({ success: true, data: course });
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
