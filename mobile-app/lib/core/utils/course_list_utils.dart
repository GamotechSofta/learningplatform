import '../../models/course.dart';
import 'course_playability.dart';

enum CoursePriceFilter { all, free, premium }

enum CourseSortOption {
  featured,
  nameAsc,
  nameDesc,
  priceLow,
  priceHigh,
}

class CourseListUtils {
  CourseListUtils._();

  static bool hasBanner(Course course) {
    final thumb = course.thumbnail;
    return thumb != null && thumb.isNotEmpty;
  }

  /// Hide courses whose videos are corrupt or missing on the server.
  static bool hasPlayableVideos(Course course) =>
      CoursePlayability.isListable(course);

  static List<Course> filterAndSort({
    required List<Course> courses,
    String query = '',
    String? categoryId,
    String? level,
    CoursePriceFilter priceFilter = CoursePriceFilter.all,
    CourseSortOption sort = CourseSortOption.featured,
  }) {
    final normalizedQuery = query.trim().toLowerCase();

    final filtered = courses.where((course) {
      if (!hasPlayableVideos(course)) return false;

      if (categoryId != null && course.categoryId != categoryId) return false;

      if (level != null && course.level.toLowerCase() != level.toLowerCase()) {
        return false;
      }

      switch (priceFilter) {
        case CoursePriceFilter.free:
          if (course.isPaid) return false;
        case CoursePriceFilter.premium:
          if (!course.isPaid) return false;
        case CoursePriceFilter.all:
          break;
      }

      if (normalizedQuery.isEmpty) return true;

      final haystack =
          '${course.title} ${course.description} ${course.categoryName ?? ''}'
              .toLowerCase();
      return haystack.contains(normalizedQuery);
    }).toList();

    filtered.sort((a, b) => _compare(a, b, sort));
    return filtered;
  }

  static int _compare(Course a, Course b, CourseSortOption sort) {
    switch (sort) {
      case CourseSortOption.featured:
        final bannerCompare =
            (hasBanner(a) ? 0 : 1).compareTo(hasBanner(b) ? 0 : 1);
        if (bannerCompare != 0) return bannerCompare;
        return a.title.toLowerCase().compareTo(b.title.toLowerCase());
      case CourseSortOption.nameAsc:
        return a.title.toLowerCase().compareTo(b.title.toLowerCase());
      case CourseSortOption.nameDesc:
        return b.title.toLowerCase().compareTo(a.title.toLowerCase());
      case CourseSortOption.priceLow:
        return _effectivePrice(a).compareTo(_effectivePrice(b));
      case CourseSortOption.priceHigh:
        return _effectivePrice(b).compareTo(_effectivePrice(a));
    }
  }

  static double _effectivePrice(Course course) {
    final p = course.pricing;
    if (p.lifetime > 0) return p.lifetime;
    if (p.yearly > 0) return p.yearly;
    if (p.monthly > 0) return p.monthly;
    return 0;
  }

  static ({List<Course> withBanner, List<Course> withoutBanner}) partitionByBanner(
    List<Course> courses,
  ) {
    final withBanner = <Course>[];
    final withoutBanner = <Course>[];

    for (final course in courses) {
      if (hasBanner(course)) {
        withBanner.add(course);
      } else {
        withoutBanner.add(course);
      }
    }

    return (withBanner: withBanner, withoutBanner: withoutBanner);
  }
}
