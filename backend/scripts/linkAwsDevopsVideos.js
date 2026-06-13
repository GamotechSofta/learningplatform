import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import Video from "../models/video.js";

dotenv.config();

const ensureLesson = async (courseId, title) => {
  let lesson = await Lesson.findOne({ course: courseId, title });
  if (lesson) return lesson;

  const order = await Lesson.countDocuments({ course: courseId });
  lesson = await Lesson.create({
    course: courseId,
    title,
    description: "AWS DevOps tutorials for beginners.",
    order,
    isFree: true,
    isPublished: true,
  });
  console.log("Created lesson:", title);
  return lesson;
};

const linkAwsDevopsVideos = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const beginner = await Course.findOne({ title: /aws devops beginner/i });
  const fullCourse = await Course.findOne({ title: /aws devops full course/i });

  if (!beginner) throw new Error('Course "AWS Devops Beginner" not found');
  if (!fullCourse) throw new Error('Course "Aws Devops Full Course" not found');

  const sourceLesson = await Lesson.findOne({ course: fullCourse._id }).sort({ order: 1 });
  if (!sourceLesson) throw new Error("No lesson found on Aws Devops Full Course");

  const targetLesson = await ensureLesson(beginner._id, "AWS DevOps Beginner");
  const sourceVideos = await Video.find({ lesson: sourceLesson._id }).sort({ order: 1 });

  if (!sourceVideos.length) {
    throw new Error("No source AWS videos found on full course");
  }

  let created = 0;
  let updated = 0;

  for (const source of sourceVideos) {
    const payload = {
      lesson: targetLesson._id,
      title: source.title,
      description: source.description,
      videoKey: source.videoKey,
      thumbnailKey: source.thumbnailKey,
      externalUrl: source.externalUrl,
      duration: source.duration,
      size: source.size,
      order: source.order,
      isPublished: true,
    };

    const existing = await Video.findOne({
      lesson: targetLesson._id,
      videoKey: source.videoKey,
    });

    if (existing) {
      Object.assign(existing, payload);
      await existing.save();
      updated += 1;
    } else {
      await Video.create(payload);
      created += 1;
    }
  }

  console.log(`AWS Devops Beginner: ${sourceVideos.length} video(s) linked`);
  console.log(`Created: ${created} | Updated: ${updated}`);
  console.log(`Course: ${beginner.title} (${beginner._id})`);
  console.log(`Lesson: ${targetLesson.title} (${targetLesson._id})`);

  await mongoose.disconnect();
};

linkAwsDevopsVideos().catch((err) => {
  console.error("AWS link failed:", err.message);
  process.exit(1);
});
