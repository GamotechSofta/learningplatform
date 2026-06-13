import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';
import '../models/course.dart';
import 'course_side_thumbnail.dart';

class CourseCard extends StatelessWidget {
  const CourseCard({
    super.key,
    required this.course,
    required this.onTap,
  });

  final Course course;
  final VoidCallback onTap;

  static const _thumbWidth = 120.0;
  static const _thumbHeight = 90.0;

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      color: AppColors.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: AppColors.border),
      ),
      child: InkWell(
        onTap: onTap,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CourseSideThumbnail(
              course: course,
              width: _thumbWidth,
              height: _thumbHeight,
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                      Text(
                        course.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                              height: 1.2,
                            ),
                      ),
                      if (course.categoryName != null &&
                          course.categoryName!.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          course.categoryName!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                      ],
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          if (course.isPaid) const _Chip(label: 'Premium', premium: true),
                          if (course.videoCount > 0)
                            _Chip(label: '${course.videoCount} videos'),
                          Text(
                            course.pricing.displayPrice,
                            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w800,
                                ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({
    required this.label,
    this.premium = false,
  });

  final String label;
  final bool premium;

  @override
  Widget build(BuildContext context) {
    if (premium) return const _ShinyPremiumBadge();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.primaryLight,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }
}

class _ShinyPremiumBadge extends StatelessWidget {
  const _ShinyPremiumBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFFFFF59D),
            Color(0xFFFFD54F),
            Color(0xFFFFB300),
            Color(0xFFFF8F00),
          ],
          stops: [0.0, 0.35, 0.72, 1.0],
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.workspace_premium_rounded,
            size: 13,
            color: const Color(0xFF5D4037).withValues(alpha: 0.9),
          ),
          const SizedBox(width: 4),
          Text(
            'Premium',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: const Color(0xFF4E342E),
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.2,
                ),
          ),
        ],
      ),
    );
  }
}
