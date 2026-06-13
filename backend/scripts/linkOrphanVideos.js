import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import Video from "../models/video.js";

dotenv.config();

const RULES = [
  {
    courseMatch: /java for beginners/i,
    lessonTitle: "Java For Beginners",
    videoMatch: (text) => /\bjava\b/i.test(text),
  },
  {
    courseMatch: /wordpress/i,
    lessonTitle: "WordPress Course",
    videoMatch: (text) => /wordpress|wordrpress/i.test(text),
  },
  {
    courseMatch: /internet of things|\(iot\)/i,
    lessonTitle: "Internet of Things (IoT)",
    videoMatch: (text) => /internet of things|\biot\b/i.test(text),
  },
  {
    courseMatch: /aws devops beginner/i,
    lessonTitle: "AWS DevOps Beginner",
    videoMatch: (text) => /\baws\b/i.test(text),
  },
];

const ensureLesson = async (courseId, title) => {
  let lesson = await Lesson.findOne({ course: courseId, title });
  if (lesson) return lesson;

  const order = await Lesson.countDocuments({ course: courseId });
  lesson = await Lesson.create({
    course: courseId,
    title,
    description: "",
    order,
    isFree: false,
    isPublished: true,
  });
  console.log("Created lesson:", title);
  return lesson;
};

const linkOrphanVideos = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const allLessons = await Lesson.find().select("_id");
  const validLessonIds = new Set(allLessons.map((lesson) => lesson._id.toString()));

  const orphans = await Video.find().sort({ order: 1 });
  const orphanVideos = orphans.filter((video) => {
    if (!video.videoKey && !video.externalUrl) return false;
    if (!video.lesson) return true;
    return !validLessonIds.has(video.lesson.toString());
  });

  console.log(`Found ${orphanVideos.length} orphan video(s) with playable media.`);

  let linked = 0;

  for (const rule of RULES) {
    const course = await Course.findOne({ title: rule.courseMatch });
    if (!course) {
      console.log("No course found for rule:", rule.courseMatch);
      continue;
    }

    const lesson = await ensureLesson(course._id, rule.lessonTitle);
    const matches = orphanVideos.filter((video) => {
      const text = `${video.title || ""} ${video.videoKey || ""}`;
      return rule.videoMatch(text);
    });

    console.log(`\n${course.title}: linking ${matches.length} orphan video(s)`);

    for (let index = 0; index < matches.length; index += 1) {
      const video = matches[index];
      video.lesson = lesson._id;
      video.order = index;
      video.isPublished = true;
      await video.save();
      linked += 1;
      console.log("  Linked:", video.title?.slice(0, 70));
    }
  }

  console.log(`\nDone. Linked ${linked} orphan video(s).`);
  await mongoose.disconnect();
};

linkOrphanVideos().catch((err) => {
  console.error("Link failed:", err.message);
  process.exit(1);
});
