import "dotenv/config";
import mongoose from "mongoose";
import Video from "../models/video.js";
import { readObjectRange } from "../utils/s3.js";
import { looksLikeValidVideo } from "../utils/videoIntegrity.js";

const courseTitle = process.argv[2] || "Java For Beginners";
const apply = process.argv.includes("--apply");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const Course = (await import("../models/course.js")).default;
  const Lesson = (await import("../models/lesson.js")).default;

  const course = await Course.findOne({ title: courseTitle }).lean();
  if (!course) throw new Error(`Course not found: ${courseTitle}`);

  const lessons = await Lesson.find({ course: course._id }).select("_id");
  const videos = await Video.find({
    lesson: { $in: lessons.map((l) => l._id) },
    isPublished: true,
  }).sort({ order: 1 });

  console.log(`Checking ${videos.length} published video(s) for "${courseTitle}"...\n`);

  for (const video of videos) {
    const doc = video.toObject();
    if (!doc.videoKey) {
      console.log(`- ${doc.title}`);
      console.log("  status: NO videoKey/externalUrl — cannot play in app\n");
      continue;
    }

    try {
      const header = await readObjectRange(doc.videoKey, 0, 65535);
      const valid = looksLikeValidVideo(header);
      console.log(`- ${doc.title}`);
      console.log(`  key: ${doc.videoKey}`);
      console.log(`  mediaValid in DB: ${doc.mediaValid}`);
      console.log(`  S3 header valid: ${valid}`);

      if (apply) {
        await Video.updateOne(
          { _id: video._id },
          { $set: { mediaValid: valid } }
        );
        console.log(`  => updated mediaValid to ${valid}`);
      } else if (valid && doc.mediaValid === false) {
        console.log("  => run with --apply to set mediaValid: true");
      }
      console.log();
    } catch (err) {
      console.log(`- ${doc.title}`);
      console.log(`  key: ${doc.videoKey}`);
      console.log(`  S3 error: ${err.message}\n`);
    }
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
