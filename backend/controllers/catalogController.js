import Category from "../models/category.js";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import Video from "../models/video.js";
import asyncHandler from "../middleware/asyncHandler.js";

async function latestUpdatedAt(Model) {
  const doc = await Model.findOne().sort({ updatedAt: -1 }).select("updatedAt").lean();
  return doc?.updatedAt ? new Date(doc.updatedAt).getTime() : 0;
}

/**
 * Lightweight revision token derived from the newest content change.
 * Website and app poll this to refresh when the admin panel updates catalog data.
 */
export const getCatalogRevision = asyncHandler(async (req, res) => {
  const [categoryAt, courseAt, lessonAt, videoAt] = await Promise.all([
    latestUpdatedAt(Category),
    latestUpdatedAt(Course),
    latestUpdatedAt(Lesson),
    latestUpdatedAt(Video),
  ]);

  const revision = Math.max(categoryAt, courseAt, lessonAt, videoAt);

  res.set("Cache-Control", "no-store");
  res.json({
    success: true,
    data: { revision },
  });
});
