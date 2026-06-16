import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../models/course.dart';
import 'recommended_course_card.dart';

/// Smooth horizontal rail — replaces the old paging carousel.
class RecommendedCoursesCarousel extends StatelessWidget {
  const RecommendedCoursesCarousel({
    super.key,
    required this.courses,
    required this.onCourseTap,
    this.showRank = false,
  });

  final List<Course> courses;
  final ValueChanged<Course> onCourseTap;

  /// Kept for API compatibility; ranking UI removed for a cleaner look.
  final bool showRank;

  @override
  Widget build(BuildContext context) {
    if (courses.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: RecommendedCourseCard.cardHeight,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        clipBehavior: Clip.none,
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        itemCount: courses.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (context, index) {
          final course = courses[index];
          return RecommendedCourseCard(
            course: course,
            onTap: () {
              HapticFeedback.selectionClick();
              onCourseTap(course);
            },
          );
        },
      ),
    );
  }
}
