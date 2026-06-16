import Video from "../models/video.js";
import { resolveMediaUrl } from "./mediaUrl.js";

export const pickVideoThumbnail = (video) =>
  resolveMediaUrl(video?.thumbnail || video?.thumbnailKey);

export const pickVideoUrl = (video) => {
  if (!video) return "";

  const direct = video.videoUrl || video.externalUrl;
  if (direct) return resolveMediaUrl(direct);

  return resolveMediaUrl(video.videoKey);
};

export const pickHlsUrl = (video) => {
  if (!video) return "";
  if (video.hlsUrl) return resolveMediaUrl(video.hlsUrl);
  return resolveMediaUrl(video.hlsKey);
};

export const firstThumbnailFromLessons = (lessons = []) => {
  for (const lesson of lessons) {
    for (const video of lesson.videos || []) {
      const thumb = pickVideoThumbnail(video);
      if (thumb) return thumb;
    }
  }
  return "";
};

export const firstVideoUrlFromLessons = (lessons = []) => {
  for (const lesson of lessons) {
    for (const video of lesson.videos || []) {
      const url = pickVideoUrl(video);
      if (url) return url;
    }
  }
  return "";
};

export const applyCourseThumbnailFallbacks = (courseData) => {
  courseData.thumbnail = resolveMediaUrl(courseData.thumbnail);

  if (!courseData.thumbnail) {
    courseData.thumbnail = firstThumbnailFromLessons(courseData.lessons);
  }

  if (!courseData.thumbnail) {
    const previewVideoUrl = firstVideoUrlFromLessons(courseData.lessons);
    if (previewVideoUrl) courseData.previewVideoUrl = previewVideoUrl;
  }

  return courseData;
};

/**
 * For course list responses without embedded lessons, load the first video
 * thumbnail or preview video URL per course from the database.
 */
export const attachFallbackThumbnails = async (courseItems) => {
  const list = courseItems.map((course) => {
    const data = course?.toObject ? course.toObject() : { ...course };
    data.thumbnail = resolveMediaUrl(data.thumbnail);
    return data;
  });

  const needsMedia = list.filter((course) => course._id);
  if (needsMedia.length === 0) return list;

  const courseIds = [...new Set(needsMedia.map((course) => course._id))];

  const videos = await Video.aggregate([
    {
      $lookup: {
        from: "lessons",
        localField: "lesson",
        foreignField: "_id",
        as: "lessonDoc",
      },
    },
    { $unwind: "$lessonDoc" },
    {
      $match: {
        "lessonDoc.course": { $in: courseIds },
        $or: [
          { thumbnailKey: { $exists: true, $ne: "" } },
          { videoKey: { $exists: true, $ne: "" } },
          { externalUrl: { $exists: true, $ne: "" } },
        ],
      },
    },
    { $sort: { "lessonDoc.order": 1, order: 1 } },
    {
      $group: {
        _id: "$lessonDoc.course",
        thumbnailKey: { $first: "$thumbnailKey" },
        videoKey: { $first: "$videoKey" },
        externalUrl: { $first: "$externalUrl" },
      },
    },
  ]);

  const mediaByCourse = Object.fromEntries(
    videos.map((entry) => {
      const thumbnail = resolveMediaUrl(entry.thumbnailKey);
      const previewVideoUrl =
        resolveMediaUrl(entry.videoKey) || resolveMediaUrl(entry.externalUrl);
      return [entry._id.toString(), { thumbnail, previewVideoUrl }];
    })
  );

  return list.map((course) => {
    const media = mediaByCourse[course._id.toString()];
    if (!media) return course;

    if (!course.thumbnail && media.thumbnail) {
      course.thumbnail = media.thumbnail;
    }
    if (!course.thumbnail && media.previewVideoUrl) {
      course.previewVideoUrl = media.previewVideoUrl;
    } else if (!course.previewVideoUrl && media.previewVideoUrl) {
      course.previewVideoUrl = media.previewVideoUrl;
    }

    return course;
  });
};
