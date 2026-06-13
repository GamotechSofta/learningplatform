import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../models/course.dart';
import 'recommended_course_card.dart';

class RecommendedCoursesCarousel extends StatefulWidget {
  const RecommendedCoursesCarousel({
    super.key,
    required this.courses,
    required this.onCourseTap,
    this.showRank = false,
  });

  final List<Course> courses;
  final ValueChanged<Course> onCourseTap;
  final bool showRank;

  @override
  State<RecommendedCoursesCarousel> createState() =>
      _RecommendedCoursesCarouselState();
}

class _RecommendedCoursesCarouselState extends State<RecommendedCoursesCarousel> {
  late final PageController _pageController;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(viewportFraction: 0.88);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.courses.isEmpty) return const SizedBox.shrink();

    return Column(
      children: [
        SizedBox(
          height: 268,
          child: PageView.builder(
            controller: _pageController,
            padEnds: false,
            itemCount: widget.courses.length,
            onPageChanged: (index) => setState(() => _currentPage = index),
            itemBuilder: (context, index) {
              final course = widget.courses[index];
              return Padding(
                padding: EdgeInsets.only(
                  left: index == 0 ? 20 : 6,
                  right: index == widget.courses.length - 1 ? 20 : 6,
                ),
                child: RecommendedCourseCard(
                  course: course,
                  rank: widget.showRank && index < 3 ? index + 1 : null,
                  onTap: () => widget.onCourseTap(course),
                ),
              );
            },
          ),
        ),
        if (widget.courses.length > 1) ...[
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(widget.courses.length, (index) {
              final active = index == _currentPage;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 220),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: active ? 18 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: active
                      ? AppColors.primary
                      : AppColors.border,
                  borderRadius: BorderRadius.circular(99),
                ),
              );
            }),
          ),
        ],
      ],
    );
  }
}
