export const isPaidCourse = (course) => {
  const pricing = course?.pricing;
  if (!pricing) return false;
  return (
    (pricing.monthly ?? 0) > 0 ||
    (pricing.yearly ?? 0) > 0 ||
    (pricing.lifetime ?? 0) > 0
  );
};

const hasActiveSubscription = (user, courseId) => {
  if (!user || !courseId) return false;

  const targetId = courseId.toString();
  return user.subscriptions?.some((sub) => {
    if (sub.status !== "active") return false;
    if (sub.endDate && new Date(sub.endDate) <= new Date()) return false;
    const subCourseId = sub.course?._id?.toString() ?? sub.course?.toString();
    return subCourseId === targetId;
  });
};

/** True only when the user bought/enrolled in this exact course. */
export const userHasPurchasedCourse = (user, courseId) =>
  hasActiveSubscription(user, courseId);

/** Playback access (includes admin/instructor bypass). */
export const userHasCourseAccess = (user, courseId) => {
  if (!user || !courseId) return false;
  if (["admin", "instructor"].includes(user.role)) return true;
  return hasActiveSubscription(user, courseId);
};

import { pickVideoUrl, pickVideoThumbnail } from "./courseThumbnail.js";

const stripLockedVideoMedia = (video) => {
  const previewVideoUrl = pickVideoUrl(video);
  const thumbnail = pickVideoThumbnail(video) || video?.thumbnail;

  const sanitized = {
    ...video,
    isLocked: true,
    thumbnail: thumbnail || video?.thumbnail,
    previewVideoUrl,
  };
  delete sanitized.videoUrl;
  delete sanitized.videoKey;
  delete sanitized.externalUrl;
  return sanitized;
};

/**
 * Every paid course shows 1 free preview video until purchased.
 * Only the purchased course is fully unlocked — other courses stay locked.
 */
export const applyCourseAccess = (courseData, user) => {
  const paid = isPaidCourse(courseData);
  const courseId = courseData._id?.toString();
  const hasPurchased = userHasPurchasedCourse(user, courseId);
  const hasAccess = !paid ? true : userHasCourseAccess(user, courseId);

  courseData.isPaid = paid;
  courseData.hasPurchased = hasPurchased;
  courseData.hasAccess = hasAccess;
  courseData.previewVideoCount = 1;

  if (hasAccess) {
    for (const lesson of courseData.lessons || []) {
      lesson.videos = (lesson.videos || []).map((video) => ({
        ...video,
        isLocked: false,
      }));
    }
    return courseData;
  }

  let previewGranted = false;

  for (const lesson of courseData.lessons || []) {
    lesson.videos = (lesson.videos || []).map((video) => {
      if (!previewGranted) {
        previewGranted = true;
        return { ...video, isLocked: false };
      }
      return stripLockedVideoMedia(video);
    });
  }

  return courseData;
};
