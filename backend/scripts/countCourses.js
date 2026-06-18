import "dotenv/config";
import mongoose from "mongoose";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import Video from "../models/video.js";
import { getPlayableCourseIdSet } from "../utils/coursePlayability.js";

const playableFilter = {
  isPublished: true,
  mediaValid: { $ne: false },
  $or: [
    { videoKey: { $exists: true, $nin: [null, ""] } },
    { externalUrl: { $exists: true, $nin: [null, ""] } },
    { hlsKey: { $exists: true, $nin: [null, ""] } },
  ],
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const allCourses = await Course.find({}).select("title isPublished").lean();
  const publishedCourses = allCourses.filter((c) => c.isPublished);
  const draftCourses = allCourses.filter((c) => !c.isPublished);

  const playableIds = await getPlayableCourseIdSet(allCourses.map((c) => c._id));
  const appListable = publishedCourses.filter((c) =>
    playableIds.has(c._id.toString())
  );

  const publishedNoPlayable = publishedCourses.filter(
    (c) => !playableIds.has(c._id.toString())
  );

  // Admin panel uses GET /api/courses (no published filter)
  const adminApiCount = allCourses.length;

  // Public website/app uses GET /api/courses?published=true (all published courses)
  const publicApiCount = publishedCourses.length;

  console.log(JSON.stringify({
    adminPanel: {
      totalCourses: adminApiCount,
      published: publishedCourses.length,
      drafts: draftCourses.length,
    },
    websiteAndApp: {
      publishedCourses: publicApiCount,
      note: "All published courses (includes those still uploading videos)",
    },
    withPlayableVideosOnly: {
      count: appListable.length,
      note: "Published courses with at least one published playable video",
    },
    gap: {
      publishedWithoutPlayableVideo: publishedNoPlayable.length,
      draftsHidden: draftCourses.length,
    },
    publishedButNotInApp: publishedNoPlayable.map((c) => ({
      title: c.title,
      reason: "No published video with media (videoKey/externalUrl/hlsKey)",
    })),
    drafts: draftCourses.map((c) => c.title),
  }, null, 2));

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
