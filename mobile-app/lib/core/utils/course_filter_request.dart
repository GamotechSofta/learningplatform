import 'package:flutter/foundation.dart';

import 'course_list_utils.dart';

class CourseFilters {
  const CourseFilters({
    this.categoryId,
    this.level,
    this.priceFilter = CoursePriceFilter.all,
    this.sort = CourseSortOption.nameAsc,
  });

  final String? categoryId;
  final String? level;
  final CoursePriceFilter priceFilter;
  final CourseSortOption sort;
}

/// Hands filters chosen outside the Courses tab (e.g. the home filter sheet)
/// to [CoursesScreen], which consumes and clears the pending value.
class CourseFilterRequest {
  CourseFilterRequest._();

  static final pending = ValueNotifier<CourseFilters?>(null);
}
