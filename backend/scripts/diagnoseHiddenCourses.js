import "dotenv/config";
import mongoose from "mongoose";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import Video from "../models/video.js";

const hiddenTitles = [
  "Java For Beginners",
  "Printer Repairing Course",
  "Automotive Full Course",
  "ECM Repairing Course",
  "Fridge Repairing Course",
  "Laptop Repairing Complete Course",
  "WordPress No-Coding",
  "House Wiring Course",
  "Piping Training Course",
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const title of hiddenTitles) {
    const course = await Course.findOne({ title }).lean();
    if (!course) {
      console.log(`${title}: NOT FOUND`);
      continue;
    }
    const lessons = await Lesson.find({ course: course._id }).select("_id");
    const videos = await Video.collection
      .find({ lesson: { $in: lessons.map((l) => l._id) } })
      .toArray();

    const published = videos.filter((v) => v.isPublished);
    const legacyUrl = published.filter(
      (v) => !v.videoKey && !v.externalUrl && !v.hlsKey && v.videoUrl
    );
    const mediaFalse = published.filter((v) => v.mediaValid === false);
    const noMedia = published.filter(
      (v) => !v.videoKey && !v.externalUrl && !v.hlsKey && !v.videoUrl
    );

    console.log(
      `${title}: published=${published.length} legacyVideoUrl=${legacyUrl.length} mediaValidFalse=${mediaFalse.length} noMedia=${noMedia.length} unpublished=${videos.length - published.length}`
    );
  }

  await mongoose.disconnect();
}

main();
