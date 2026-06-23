import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { importQuestionsFromCsv } from "../services/questionService.js";

dotenv.config();

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Downloading and importing JEE Mains Mathematics questions...");
  const stats = await importQuestionsFromCsv({ clearExisting: false });

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
