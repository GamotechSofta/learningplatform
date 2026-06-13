import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import { isPaidCourse } from "../utils/courseAccess.js";

dotenv.config();

/**
 * Lessons linked via orphan scripts were incorrectly marked isFree: true.
 * Paid courses should use the 1-preview rule until purchased — not free lessons.
 */
const fixPaidLessonFlags = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const courses = await Course.find().lean();
  const paidCourseIds = courses.filter(isPaidCourse).map((c) => c._id);

  const result = await Lesson.updateMany(
    { course: { $in: paidCourseIds }, isFree: true },
    { $set: { isFree: false } }
  );

  console.log(
    `Updated ${result.modifiedCount} lesson(s) on paid courses: isFree -> false`
  );

  await mongoose.disconnect();
};

fixPaidLessonFlags().catch((err) => {
  console.error("Fix failed:", err.message);
  process.exit(1);
});
