import dotenv from "dotenv";
import mongoose from "mongoose";
import Category from "../models/category.js";
import Course from "../models/course.js";
import { resolveMediaUrl } from "../utils/mediaUrl.js";

dotenv.config();

const fixCollection = async (Model, label) => {
  const docs = await Model.find({ thumbnail: { $exists: true, $ne: "" } });
  let fixed = 0;

  for (const doc of docs) {
    const resolved = resolveMediaUrl(doc.thumbnail);
    if (resolved && resolved !== doc.thumbnail) {
      doc.thumbnail = resolved;
      await doc.save();
      fixed += 1;
      console.log(`${label}: ${doc.name || doc.title} -> ${resolved}`);
    }
  }

  return fixed;
};

const fixThumbnails = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const categoryFixed = await fixCollection(Category, "Category");
  const courseFixed = await fixCollection(Course, "Course");

  console.log(`\nDone. Fixed ${categoryFixed + courseFixed} thumbnail(s).`);
  await mongoose.disconnect();
};

fixThumbnails().catch((err) => {
  console.error("Thumbnail fix failed:", err.message);
  process.exit(1);
});
