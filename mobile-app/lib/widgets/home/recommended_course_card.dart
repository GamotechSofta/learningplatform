import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/themed_colors.dart';
import '../../models/course.dart';
import '../animated_pressable.dart';
import '../save_course_button.dart';
import '../thumbnail_image.dart';
import '../course_rating_stars.dart';

/// Compact editorial card for the home recommended rail.
class RecommendedCourseCard extends StatelessWidget {
  const RecommendedCourseCard({
    super.key,
    required this.course,
    required this.onTap,
  });

  final Course course;
  final VoidCallback onTap;

  static const cardWidth = 268.0;
  static const imageHeight = 150.0;
  static const cardHeight = 312.0;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final theme = Theme.of(context);

    return SizedBox(
      width: cardWidth,
      height: cardHeight,
      child: AnimatedPressable(
        onTap: onTap,
        borderRadius: 16,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: c.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: c.border.withValues(alpha: 0.65)),
            boxShadow: [
              BoxShadow(
                color: c.cardShadow,
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(15),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(
                  height: imageHeight,
                  child: ThumbnailImage(
                    url: course.thumbnail,
                    videoUrl: course.previewVideoUrl,
                    height: imageHeight,
                    width: cardWidth,
                    borderRadius: 0,
                    fit: BoxFit.cover,
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          course.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: c.textPrimary,
                            height: 1.3,
                            letterSpacing: -0.15,
                          ),
                        ),
                        const SizedBox(height: 4),
                        CourseRatingStars(course: course),
                        const SizedBox(height: 4),
                        Text(
                          _metaLine(course),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: c.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const Spacer(),
                        Divider(
                          height: 1,
                          thickness: 1,
                          color: c.border.withValues(alpha: 0.55),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                _priceLabel(course),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: theme.textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.w800,
                                  color: _priceColor(course),
                                  letterSpacing: -0.2,
                                ),
                              ),
                            ),
                            SaveCourseButton(
                              course: course,
                              iconSize: 20,
                              padding: const EdgeInsets.all(8),
                              filledBackground: false,
                            ),
                            const SizedBox(width: 6),
                            _ArrowAction(),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _metaLine(Course course) {
    final parts = <String>[
      if (course.categoryName != null && course.categoryName!.isNotEmpty)
        course.categoryName!,
      _levelLabel(course.level),
      if (course.videoCount > 0)
        '${course.videoCount} ${course.videoCount == 1 ? 'lesson' : 'lessons'}',
    ];
    return parts.join('  ·  ');
  }

  String _levelLabel(String level) {
    return switch (level.toLowerCase()) {
      'intermediate' => 'Intermediate',
      'advanced' => 'Advanced',
      _ => 'Beginner',
    };
  }

  String _priceLabel(Course course) {
    if (!course.pricing.isPaid) return 'Free';
    return course.pricing.displayPrice;
  }

  Color _priceColor(Course course) {
    if (!course.pricing.isPaid) return AppColors.accentGreen;
    return AppColors.primary;
  }
}

class _ArrowAction extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      width: 34,
      height: 34,
      decoration: BoxDecoration(
        color: c.primaryTint,
        shape: BoxShape.circle,
        border: Border.all(color: c.primaryTintBorder),
      ),
      child: const Icon(
        Icons.arrow_forward_rounded,
        size: 16,
        color: AppColors.primary,
      ),
    );
  }
}
