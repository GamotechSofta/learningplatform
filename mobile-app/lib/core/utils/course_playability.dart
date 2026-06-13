import '../../models/course.dart';

/// Courses with known corrupt CDN files (hide until re-uploaded).
class CoursePlayability {
  CoursePlayability._();

  static const Set<String> _blockedCourseIds = {
    '6a291cc4536397913c0afa27', // Java For Beginners
    '6a2a66905d67b4cea44115cd', // WordPress No-Coding
  };

  static const Set<String> _blockedSlugs = {
    'java-for-beginners',
    'wordpress-no-coding',
  };

  static bool isBlocked(Course course) {
    return _blockedCourseIds.contains(course.id) ||
        _blockedSlugs.contains(course.slug);
  }

  static bool isListable(Course course) {
    if (isBlocked(course)) return false;
    if (course.hasPlayableVideos == false) return false;
    if (course.hasPlayableVideos == true) return true;
    // API did not send a flag — allow unless blocklisted.
    return true;
  }

  static List<Course> filterListable(List<Course> courses) {
    return courses.where(isListable).toList();
  }
}
