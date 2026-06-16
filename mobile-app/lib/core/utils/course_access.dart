import '../../models/course.dart';
import '../../models/lesson.dart';
/// Enforces 1 free demo video for paid courses until the user has purchased.
class CourseAccess {
  CourseAccess._();

  /// True when the user bought or subscribed to this course (not preview-only).
  static bool isCoursePurchased(
    Course course, {
    bool subscriptionActive = false,
  }) {
    if (!course.isPaid) return true;
    return course.hasPurchased || subscriptionActive;
  }

  static bool hasFullPlaybackAccess(
    Course course, {
    bool subscriptionActive = false,
  }) {
    if (!course.isPaid) return true;
    if (course.hasAccess || course.hasPurchased || subscriptionActive) {
      return true;
    }
    return false;
  }

  static Course applyPlaybackLocks(
    Course course, {
    bool subscriptionActive = false,
  }) {
    if (hasFullPlaybackAccess(course, subscriptionActive: subscriptionActive)) {
      return _unlockAllVideos(
        course,
        subscriptionActive: subscriptionActive,
      );
    }

    var previewGranted = false;
    final lessons = course.lessons.map((lesson) {
      if (lesson.videos.any((video) => video.isLocked)) {
        return lesson;
      }

      final videos = lesson.videos.map((video) {
        if (!previewGranted && video.hasPlayableSource) {
          previewGranted = true;
          return video.copyWith(isLocked: false);
        }
        return video.copyWith(
          isLocked: true,
          previewVideoUrl: video.previewVideoUrl ??
              (video.videoUrl.isNotEmpty
                  ? video.videoUrl
                  : video.hlsUrl),
          videoUrl: '',
        );
      }).toList();

      return Lesson(
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        description: lesson.description,
        isFree: lesson.isFree,
        isPublished: lesson.isPublished,
        videos: videos,
      );
    }).toList();

    return Course(
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnail: course.thumbnail,
      previewVideoUrl: course.previewVideoUrl,
      categoryId: course.categoryId,
      categoryName: course.categoryName,
      level: course.level,
      isPublished: course.isPublished,
      pricing: course.pricing,
      instructorName: course.instructorName,
      lessons: lessons,
      videoCount: lessons.fold<int>(0, (sum, l) => sum + l.videoCount),
      isPaid: course.isPaid,
      hasAccess: course.hasAccess,
      hasPurchased: course.hasPurchased,
      previewVideoCount: 1,
    );
  }

  static Course _unlockAllVideos(
    Course course, {
    bool subscriptionActive = false,
  }) {
    final lessons = course.lessons.map((lesson) {
      final videos = lesson.videos.map((video) {
        final playbackUrl = video.videoUrl.isNotEmpty
            ? video.videoUrl
            : (video.previewVideoUrl ?? '');
        return video.copyWith(
          isLocked: false,
          videoUrl: playbackUrl,
        );
      }).toList();

      return Lesson(
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        description: lesson.description,
        isFree: lesson.isFree,
        isPublished: lesson.isPublished,
        videos: videos,
      );
    }).toList();

    final playableCount =
        lessons.fold<int>(0, (sum, lesson) => sum + lesson.videos.length);

    return Course(
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnail: course.thumbnail,
      previewVideoUrl: course.previewVideoUrl,
      categoryId: course.categoryId,
      categoryName: course.categoryName,
      level: course.level,
      isPublished: course.isPublished,
      pricing: course.pricing,
      instructorName: course.instructorName,
      lessons: lessons,
      videoCount: playableCount > 0 ? playableCount : course.videoCount,
      isPaid: course.isPaid,
      hasAccess: true,
      hasPurchased: course.hasPurchased || subscriptionActive,
      previewVideoCount: course.previewVideoCount,
      hasPlayableVideos: course.hasPlayableVideos,
    );
  }

  static String? firstPlayableVideoId(Course course) {
    for (final lesson in course.lessons) {
      for (final video in lesson.videos) {
        if (!video.isLocked && video.hasPlayableSource) return video.id;
      }
    }
    return null;
  }

  static bool isVideoPlayable(
    Course course,
    String videoId, {
    bool subscriptionActive = false,
  }) {
    final locked = applyPlaybackLocks(
      course,
      subscriptionActive: subscriptionActive,
    );
    for (final lesson in locked.lessons) {
      for (final video in lesson.videos) {
        if (video.id == videoId) {
          return !video.isLocked && video.hasPlayableSource;
        }
      }
    }
    return false;
  }
}
