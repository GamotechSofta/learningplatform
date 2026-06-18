import '../../models/course.dart';

/// Catalog screens only show published courses with at least one playable video.
class CoursePlayability {
  CoursePlayability._();

  /// True when the course has at least one published video with a usable source URL.
  static bool hasPlayableVideo(Course course) {
    for (final lesson in course.lessons) {
      for (final video in lesson.videos) {
        if (video.isPublished && video.hasPlayableSource) return true;
      }
    }
    return false;
  }

  static bool isListable(Course course) {
    if (!course.isPublished) return false;
    if (course.hasPlayableVideos == false) return false;

    // Full payloads include lessons — verify media locally, not just counts.
    if (course.lessons.isNotEmpty) {
      return hasPlayableVideo(course);
    }

    // Summary/list payloads: require explicit playable flag plus a positive count.
    return course.hasPlayableVideos == true && course.videoCount > 0;
  }

  static List<Course> filterListable(List<Course> courses) {
    return courses.where(isListable).toList();
  }
}
