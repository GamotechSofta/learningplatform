import dotenv from "dotenv";
import mongoose from "mongoose";
import Video from "../models/video.js";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import { readObjectRange } from "../utils/s3.js";
import { looksLikeValidVideo } from "../utils/videoIntegrity.js";

dotenv.config();

const applyChanges = process.argv.includes("--apply");

const auditVideoIntegrity = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const videos = await Video.find({
    $or: [
      { videoKey: { $exists: true, $nin: [null, ""] } },
      { externalUrl: { $exists: true, $nin: [null, ""] } },
    ],
  })
    .select("title videoKey externalUrl lesson mediaValid")
    .lean();

  console.log(`Checking ${videos.length} video(s)...\n`);

  const corrupt = [];
  const ok = [];

  for (const video of videos) {
    if (!video.videoKey) {
      ok.push(video);
      if (applyChanges && video.mediaValid === false) {
        await Video.updateOne({ _id: video._id }, { $set: { mediaValid: true } });
      }
      continue;
    }

    try {
      const header = await readObjectRange(video.videoKey, 0, 65535);
      if (looksLikeValidVideo(header)) {
        ok.push(video);
        if (applyChanges && video.mediaValid === false) {
          await Video.updateOne({ _id: video._id }, { $set: { mediaValid: true } });
        }
        continue;
      }
      corrupt.push({ video, reason: "invalid header" });
    } catch (err) {
      corrupt.push({ video, reason: err.message });
    }
  }

  if (applyChanges && corrupt.length > 0) {
    const corruptIds = corrupt.map((entry) => entry.video._id);
    await Video.updateMany({ _id: { $in: corruptIds } }, { $set: { mediaValid: false } });
    console.log(`Marked ${corruptIds.length} video(s) as mediaValid: false\n`);
  } else if (corrupt.length > 0 && !applyChanges) {
    console.log("Run with --apply to mark corrupt videos in the database.\n");
  }

  if (corrupt.length === 0) {
    console.log(`All ${ok.length} video file(s) look valid.`);
    await mongoose.disconnect();
    return;
  }

  console.log(`CORRUPT: ${corrupt.length} video(s)\n`);

  for (const entry of corrupt) {
    const { video, reason } = entry;
    let courseTitle = "";
    if (video.lesson) {
      const lesson = await Lesson.findById(video.lesson).select("course title").lean();
      if (lesson?.course) {
        const course = await Course.findById(lesson.course).select("title").lean();
        courseTitle = course?.title || "";
      }
    }

    console.log(`- ${video.title}`);
    console.log(`  course: ${courseTitle || "(unknown)"}`);
    console.log(`  key:    ${video.videoKey || video.externalUrl}`);
    console.log(`  reason: ${reason}\n`);
  }

  console.log(`Valid: ${ok.length}, Corrupt: ${corrupt.length}`);
  await mongoose.disconnect();
};

auditVideoIntegrity().catch((err) => {
  console.error("Audit failed:", err.message);
  process.exit(1);
});
