import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "../models/course.js";
import { importQuestionsFromCsv } from "../services/questionService.js";

dotenv.config();

const COURSE_TITLE = process.env.IMPORT_COURSE_TITLE || "Mathematics";

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const course =
    (await Course.findOne({ title: new RegExp(`^${COURSE_TITLE}$`, "i") })) ||
    (await Course.findOne({ slug: COURSE_TITLE.toLowerCase().replace(/\s+/g, "-") }));

  if (!course) {
    throw new Error(`Course not found: ${COURSE_TITLE}`);
  }

  console.log(`Downloading and importing JEE Mains questions into "${course.title}" (${course._id})...`);
  const stats = await importQuestionsFromCsv({ clearExisting: false, courseId: course._id });

  console.log("Import complete:");
  console.log(`  Total rows: ${stats.totalRows}`);
  console.log(`  Imported:   ${stats.imported}`);
  console.log(`  Updated:    ${stats.updated}`);
  console.log(`  Skipped:    ${stats.skipped}`);

  if (stats.errors.length) {
    console.log(`  Errors:     ${stats.errors.length}`);
    stats.errors.slice(0, 5).forEach((message) => console.log(`    - ${message}`));
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Import failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
