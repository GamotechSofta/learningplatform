import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import Category from "../models/category.js";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import Video from "../models/video.js";
import User from "../models/user.js";
import { getPublicUrl } from "../utils/s3.js";

dotenv.config();

const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".webm",
  ".mov",
  ".avi",
  ".mkv",
  ".m4v",
]);

/**
 * Named presets — run one at a time so previous seeds are not touched.
 * Usage: npm run seed:s3 -- machine-learning
 */
const SEED_PRESETS = {
  "machine-learning": {
    s3Prefix: "videos/IT Courses/Machine Learning/",
    category: {
      name: "IT Courses",
      slug: "it-courses",
      description: "Information technology and software courses",
      order: 20,
    },
    course: {
      title: "Machine Learning",
      slug: "machine-learning",
      description: "Machine Learning fundamentals and practical tutorials",
      level: "intermediate",
      pricing: { monthly: 0, yearly: 0, lifetime: 0, currency: "INR" },
    },
    defaultLesson: "Machine Learning",
  },
  "computer-networking": {
    s3Prefix: "videos/IT Courses/Computer Networking/",
    category: {
      name: "IT Courses",
      slug: "it-courses",
      description: "Information technology and software courses",
      order: 20,
    },
    course: {
      title: "Computer Networking",
      slug: "computer-networking",
      description: "Computer networking concepts, protocols, and practical tutorials",
      level: "intermediate",
      pricing: { monthly: 0, yearly: 0, lifetime: 0, currency: "INR" },
    },
    defaultLesson: "Computer Networking Intermediate",
  },
  "jee-mains-physics": {
    s3Prefix: "videos/JEE Mains/Physics/",
    category: {
      name: "JEE Main",
      slug: "jee-main",
      description: "JEE Main preparation courses",
      order: 10,
    },
    course: {
      title: "JEE Mains Physics",
      slug: "jee-mains-physics",
      description: "Complete JEE Mains Physics syllabus with video lessons",
      level: "intermediate",
      pricing: { monthly: 0, yearly: 0, lifetime: 0, currency: "INR" },
    },
    defaultLesson: "Units and Measurements",
  },
};

const getBucket = () => {
  const bucket = process.env.AWS_BUCKET_NAME?.trim();
  if (!bucket) throw new Error("AWS_BUCKET_NAME is not configured");
  return bucket;
};

const getS3Client = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const region = process.env.AWS_REGION?.trim();

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials are not configured");
  }
  if (!region) throw new Error("AWS_REGION is not configured");

  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
};

const listVideoObjects = async (prefix) => {
  const bucket = getBucket();
  const client = getS3Client();
  const normalizedPrefix = prefix.replace(/^\/+/, "").replace(/\/+$/, "") + "/";

  const objects = [];
  let continuationToken;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: normalizedPrefix,
        ContinuationToken: continuationToken,
      })
    );

    for (const item of response.Contents || []) {
      if (!item.Key || item.Key.endsWith("/")) continue;
      const ext = path.extname(item.Key).toLowerCase();
      if (!VIDEO_EXTENSIONS.has(ext)) continue;
      objects.push({ key: item.Key, size: item.Size || 0 });
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return objects;
};

const titleFromFileName = (fileName) => {
  const base = path.basename(fileName, path.extname(fileName));
  return base.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || "Untitled Video";
};

const groupByLesson = (objects, prefix, defaultLesson) => {
  const normalizedPrefix = prefix.replace(/^\/+/, "").replace(/\/+$/, "") + "/";
  const groups = new Map();

  for (const obj of objects) {
    const relative = obj.key.slice(normalizedPrefix.length);
    const parts = relative.split("/").filter(Boolean);

    let lessonName;
    let fileName;

    if (parts.length >= 2) {
      lessonName = parts[0];
      fileName = parts[parts.length - 1];
    } else {
      lessonName = defaultLesson;
      fileName = parts[0] || path.basename(obj.key);
    }

    if (!groups.has(lessonName)) groups.set(lessonName, []);
    groups.get(lessonName).push({ ...obj, fileName });
  }

  return groups;
};

const upsertCategory = async (config) => {
  let category = await Category.findOne({ slug: config.slug });
  if (category) {
    Object.assign(category, config);
    await category.save();
    console.log("Category updated:", config.name);
  } else {
    category = await Category.create(config);
    console.log("Category created:", config.name);
  }
  return category;
};

const upsertCourse = async (config, categoryId, instructorId) => {
  let course = await Course.findOne({ slug: config.slug });
  const payload = {
    ...config,
    category: categoryId,
    instructor: instructorId,
    isPublished: true,
  };

  if (course) {
    Object.assign(course, payload);
    await course.save();
    console.log("Course updated:", config.title);
  } else {
    course = await Course.create(payload);
    console.log("Course created:", config.title);
  }
  return course;
};

const upsertLesson = async (courseId, title, order) => {
  let lesson = await Lesson.findOne({ course: courseId, title });
  if (lesson) {
    lesson.order = order;
    lesson.isPublished = true;
    await lesson.save();
    console.log("  Lesson updated:", title);
  } else {
    lesson = await Lesson.create({
      course: courseId,
      title,
      description: "",
      order,
      isFree: order === 0,
      isPublished: true,
    });
    console.log("  Lesson created:", title);
  }
  return lesson;
};

const upsertVideo = async (lessonId, { key, fileName, size }, order) => {
  const title = titleFromFileName(fileName);
  let video = await Video.findOne({ lesson: lessonId, videoKey: key });

  if (video) {
    video.title = title;
    video.order = order;
    video.size = size;
    video.isPublished = true;
    await video.save();
    console.log("    Video updated:", title);
  } else {
    video = await Video.create({
      lesson: lessonId,
      title,
      videoKey: key,
      size,
      order,
      isPublished: true,
    });
    console.log("    Video created:", title);
  }

  console.log("      CDN URL:", getPublicUrl(key));
  return video;
};

const resolvePreset = () => {
  const presetName = process.argv[2]?.trim();

  if (!presetName) {
    const available = Object.keys(SEED_PRESETS).join(", ");
    throw new Error(`Preset name required. Usage: npm run seed:s3 -- <preset>\nAvailable: ${available}`);
  }

  const config = SEED_PRESETS[presetName];
  if (!config) {
    const available = Object.keys(SEED_PRESETS).join(", ");
    throw new Error(`Unknown preset "${presetName}". Available: ${available}`);
  }

  return { presetName, config };
};

const seedS3Content = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  const { presetName, config } = resolvePreset();
  const { s3Prefix, category, course, defaultLesson } = config;

  console.log(`Seeding preset: ${presetName}`);
  console.log(`Listing S3 objects under s3://${getBucket()}/${s3Prefix}`);

  const objects = await listVideoObjects(s3Prefix);

  if (objects.length === 0) {
    throw new Error(`No video files found under prefix "${s3Prefix}"`);
  }

  console.log(`Found ${objects.length} video file(s)`);

  const lessonGroups = groupByLesson(objects, s3Prefix, defaultLesson);
  const lessonNames = [...lessonGroups.keys()].sort((a, b) => a.localeCompare(b));

  await mongoose.connect(process.env.MONGODB_URI);

  const instructor =
    (await User.findOne({ role: "admin" })) ||
    (await User.findOne({ role: "instructor" }));

  if (!instructor) {
    throw new Error("No admin or instructor user found. Run: npm run seed:admin");
  }

  const categoryDoc = await upsertCategory(category);
  const courseDoc = await upsertCourse(course, categoryDoc._id, instructor._id);

  for (let lessonIndex = 0; lessonIndex < lessonNames.length; lessonIndex += 1) {
    const lessonName = lessonNames[lessonIndex];
    const lesson = await upsertLesson(courseDoc._id, lessonName, lessonIndex);
    const videos = lessonGroups.get(lessonName).sort((a, b) =>
      a.fileName.localeCompare(b.fileName)
    );

    for (let videoIndex = 0; videoIndex < videos.length; videoIndex += 1) {
      await upsertVideo(lesson._id, videos[videoIndex], videoIndex);
    }
  }

  console.log("\nSeed complete.");
  console.log(`Category: ${category.name}`);
  console.log(`Course:   ${course.title}`);
  console.log(`Lessons:  ${lessonNames.join(", ")}`);

  await mongoose.disconnect();
};

seedS3Content().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
