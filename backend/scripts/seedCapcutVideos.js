import dotenv from "dotenv";
import mongoose from "mongoose";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import Category from "../models/category.js";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import Video from "../models/video.js";
import User from "../models/user.js";

dotenv.config();

const CATEGORY_NAME = "Skill Cources";
const COURSE_TITLE = "Video Editing & Content Creation Masterclass";
const LESSON_TITLE = "CapCut Video Editing – FULL COURSE in 6 Hours";
const S3_PREFIX =
  "videos/Skill Courses/Video Editing & Content Creation Masterclass/CapCut Video Editing – FULL COURSE in 6 Hours/";

const titleFromKey = (key) => {
  const file = key.split("/").pop() || key;
  return file.replace(/\.mp4$/i, "");
};

/** Put numbered CapCut lectures first, then the rest. */
const sortPriority = (key) => {
  const name = titleFromKey(key);
  const numbered = name.match(/EDITING\s+0?(\d+)/i);
  if (numbered) return Number(numbered[1]);
  if (/LAST LECTURE/i.test(name)) return 7;
  if (/FULL COURSE in 6 Hours/i.test(name) && /CapCut Video Editing -/i.test(name)) {
    return 8;
  }
  if (/CapCut Video Editing Tutorial/i.test(name)) return 9;
  return 100 + name.localeCompare("", undefined, { numeric: true });
};

const listS3Videos = async () => {
  const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  let token;
  const files = [];
  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: S3_PREFIX,
        ContinuationToken: token,
      })
    );
    for (const obj of res.Contents || []) {
      if (!obj.Key.endsWith("/")) files.push(obj);
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);

  return files.sort((a, b) => sortPriority(a.Key) - sortPriority(b.Key));
};

const seedCapcutVideos = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const category =
    (await Category.findOne({ name: CATEGORY_NAME })) ||
    (await Category.create({
      name: CATEGORY_NAME,
      slug: "skill-cources",
      description: "Skill-based practical courses",
      order: 10,
      isPublished: true,
    }));

  const admin =
    (await User.findOne({ role: "admin" })) ||
    (await User.findOne({ email: "admin@gmail.com" }));

  if (!admin) {
    throw new Error("No admin user found. Run npm run seed:admin first.");
  }

  let course = await Course.findOne({
    title: COURSE_TITLE,
    category: category._id,
  });

  if (!course) {
    course = await Course.create({
      title: COURSE_TITLE,
      slug: "video-editing-content-creation-masterclass",
      description:
        "Master video editing and content creation with CapCut, Premiere Pro, Filmora, and more.",
      instructor: admin._id,
      category: category._id,
      level: "beginner",
      pricing: { monthly: 499, yearly: 2999, lifetime: 4999, currency: "INR" },
      tags: ["video editing", "capcut", "content creation"],
      isPublished: true,
    });
    console.log("Course created:", COURSE_TITLE);
  }

  let lesson = await Lesson.findOne({
    title: LESSON_TITLE,
    course: course._id,
  });

  if (!lesson) {
    const lessonCount = await Lesson.countDocuments({ course: course._id });
    lesson = await Lesson.create({
      course: course._id,
      title: LESSON_TITLE,
      description: "Complete CapCut and video editing course videos.",
      order: lessonCount,
      isFree: false,
      isPublished: true,
    });
    console.log("Lesson created:", LESSON_TITLE);
  }

  const s3Files = await listS3Videos();
  if (!s3Files.length) {
    throw new Error(`No videos found in S3 under prefix: ${S3_PREFIX}`);
  }

  const seedKeys = new Set(s3Files.map((f) => f.Key));

  const removed = await Video.deleteMany({
    lesson: lesson._id,
    videoKey: { $nin: [...seedKeys] },
  });
  if (removed.deletedCount) {
    console.log(`Removed ${removed.deletedCount} outdated video record(s).`);
  }

  let created = 0;
  let updated = 0;

  for (let i = 0; i < s3Files.length; i++) {
    const { Key: videoKey, Size: size } = s3Files[i];
    const title = titleFromKey(videoKey);
    const payload = {
      lesson: lesson._id,
      title,
      videoKey,
      size: size || 0,
      order: i,
      isPublished: true,
    };

    const existing = await Video.findOne({ lesson: lesson._id, videoKey });
    if (existing) {
      Object.assign(existing, payload);
      await existing.save();
      updated++;
      console.log(`Updated [${i + 1}]: ${title}`);
    } else {
      await Video.create(payload);
      created++;
      console.log(`Created [${i + 1}]: ${title}`);
    }
  }

  console.log("\nDone.");
  console.log(`Category: ${category.name} (${category._id})`);
  console.log(`Course:   ${course.title} (${course._id})`);
  console.log(`Lesson:   ${lesson.title} (${lesson._id})`);
  console.log(`Videos:   ${s3Files.length} total (${created} created, ${updated} updated)`);

  await mongoose.disconnect();
};

seedCapcutVideos().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
