import Lesson from "../models/lesson.js";
import Course from "../models/course.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const createLesson = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.body.course);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const lesson = await Lesson.create(req.body);
  res.status(201).json({ success: true, data: lesson });
});

export const getLessons = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.course) filter.course = req.query.course;
  if (req.query.published === "true") filter.isPublished = true;

  const lessons = await Lesson.find(filter).sort({ order: 1 });

  res.json({ success: true, count: lessons.length, data: lessons });
});

export const getLessonsByCourse = asyncHandler(async (req, res) => {
  const lessons = await Lesson.find({ course: req.params.courseId }).sort({
    order: 1,
  });

  res.json({ success: true, count: lessons.length, data: lessons });
});

export const getLessonById = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).populate(
    "course",
    "title slug"
  );

  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  res.json({ success: true, data: lesson });
});

export const getLessonWithVideos = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id)
    .populate("course", "title slug")
    .populate({
      path: "videos",
      options: { sort: { order: 1 } },
    });

  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  res.json({ success: true, data: lesson });
});

export const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  if (req.body.course) {
    const course = await Course.findById(req.body.course);
    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }
  }

  Object.assign(lesson, req.body);
  const updatedLesson = await lesson.save();

  res.json({ success: true, data: updatedLesson });
});

export const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  await lesson.deleteOne();
  res.json({ success: true, message: "Lesson removed" });
});
