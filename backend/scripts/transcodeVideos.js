import dotenv from "dotenv";
import mongoose from "mongoose";

import Video from "../models/video.js";
import { transcodeVideoToHls } from "../utils/hlsTranscode.js";

dotenv.config();

const ids = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const all = process.argv.includes("--all");

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  let videos = [];

  if (ids.length > 0) {
    videos = await Video.find({ _id: { $in: ids } });
  } else if (all) {
    videos = await Video.find({
      videoKey: { $exists: true, $ne: "" },
      $or: [
        { streamingStatus: { $in: ["pending", "failed"] } },
        { hlsKey: { $exists: false } },
        { hlsKey: "" },
      ],
    });
  } else {
    console.log("Usage:");
    console.log("  node scripts/transcodeVideos.js --all");
    console.log("  node scripts/transcodeVideos.js <videoId> [videoId...]");
    process.exit(1);
  }

  if (!videos.length) {
    console.log("No videos to transcode.");
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log(`Transcoding ${videos.length} video(s) to adaptive HLS...`);

  for (const [index, video] of videos.entries()) {
    console.log(
      `[${index + 1}/${videos.length}] ${video.title} (${video._id})`
    );
    try {
      const key = await transcodeVideoToHls(video._id.toString());
      console.log(key ? `  ✓ ${key}` : "  ↷ skipped");
    } catch (error) {
      console.error(`  ✗ ${error.message}`);
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
