import Video from "../models/video.js";
import { PLAYABLE_MEDIA_OR } from "./coursePlayability.js";

/** Count only published videos with usable, non-corrupt media metadata. */
export const attachVideoCounts = async (courses) => {
  if (!courses?.length) return courses;

  const courseIds = courses.map((course) => course._id);
  const counts = await Video.aggregate([
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
        isPublished: true,
        mediaValid: { $ne: false },
        $or: PLAYABLE_MEDIA_OR,
      },
    },
    {
      $group: {
        _id: "$lessonDoc.course",
        videoCount: { $sum: 1 },
      },
    },
  ]);

  const countMap = Object.fromEntries(
    counts.map((row) => [row._id.toString(), row.videoCount])
  );

  return courses.map((course) => ({
    ...course,
    videoCount: countMap[course._id.toString()] || 0,
  }));
};
