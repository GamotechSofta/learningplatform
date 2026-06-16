import "dotenv/config";
import mongoose from "mongoose";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import Video from "../models/video.js";
import { getPlayableCourseIdSet } from "../utils/coursePlayability.js";
import { resolveCourseContentDirect } from "../utils/courseContentResolver.js";

const titleQuery = process.argv[2] || "Java For Beginners";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const course = await Course.findOne({
    title: new RegExp(titleQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
  }).lean();

  if (!course) {
    console.log("Course not found:", titleQuery);
    process.exit(1);
  }

  const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 }).lean();
  const lessonIds = lessons.map((l) => l._id);
  const allVideos = await Video.find({ lesson: { $in: lessonIds } })
    .sort({ order: 1 })
    .lean();

  const playableIds = await getPlayableCourseIdSet([course._id]);
  const resolved = await resolveCourseContentDirect(course, { publishedOnly: true });

  const videoRows = allVideos.map((v) => ({
    title: v.title,
    order: v.order,
    isPublished: v.isPublished,
    mediaValid: v.mediaValid,
    hasVideoKey: Boolean(v.videoKey),
    videoKey: v.videoKey ? v.videoKey.slice(0, 60) : null,
    hasExternalUrl: Boolean(v.externalUrl),
    hasHlsKey: Boolean(v.hlsKey),
    hlsKey: v.hlsKey ? v.hlsKey.slice(0, 60) : null,
    lessonId: v.lesson?.toString(),
  }));

  console.log(
    JSON.stringify(
      {
        course: {
          id: course._id.toString(),
          title: course.title,
          isPublished: course.isPublished,
          category: course.category?.toString(),
        },
        lessonCount: lessons.length,
        lessons: lessons.map((l) => ({
          id: l._id.toString(),
          title: l.title,
          isPublished: l.isPublished,
          order: l.order,
        })),
        videoCount: allVideos.length,
        publishedVideoCount: allVideos.filter((v) => v.isPublished).length,
        playablePerBackend: playableIds.has(course._id.toString()),
        resolvedLessonCount: resolved.length,
        resolvedVideoCount: resolved.reduce((n, l) => n + (l.videos?.length || 0), 0),
        videos: videoRows,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
