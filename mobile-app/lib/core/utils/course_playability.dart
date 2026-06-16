import '../../models/course.dart';

/// Listing rules for catalog screens — mirror published admin catalog entries.
class CoursePlayability {
  CoursePlayability._();

  static bool isListable(Course course) {
    if (!course.isPublished) return false;
    if (course.hasPlayableVideos == false) return false;
    return true;
  }

  static List<Course> filterListable(List<Course> courses) {
    return courses.where(isListable).toList();
  }
}
