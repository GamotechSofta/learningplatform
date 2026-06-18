import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
import '../core/utils/course_list_utils.dart';
import '../models/course.dart';
import 'animated_pressable.dart';
import 'course_placeholder_thumbnail.dart';
import 'course_rating_stars.dart';
import 'thumbnail_image.dart';

class CourseCard extends StatelessWidget {
  const CourseCard({
    super.key,
    required this.course,
    required this.onTap,
  });

  final Course course;
  final VoidCallback onTap;

  static const _thumbWidth = 104.0;
  static const _thumbHeight = 68.0;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;

    return AnimatedPressable(
      onTap: onTap,
      borderRadius: 12,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: c.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: c.border.withValues(alpha: 0.7)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: SizedBox(
                  width: _thumbWidth,
                  height: _thumbHeight,
                  child: _CardThumbnail(course: course),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          course.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: c.textPrimary,
                            height: 1.25,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _metaLine(course),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: c.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        CourseRatingStars(course: course, starSize: 11),
                        if (course.videoCount > 0) ...[
                          const SizedBox(width: 8),
                          Text(
                            '${course.videoCount}',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: c.textSecondary,
                            ),
                          ),
                        ],
                        const Spacer(),
                        Text(
                          _priceLabel(course),
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: _priceColor(course),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _metaLine(Course course) {
    final parts = <String>[];
    if (course.categoryName != null && course.categoryName!.isNotEmpty) {
      parts.add(course.categoryName!);
    }
    parts.add(_levelLabel(course.level));
    if (course.isPaid) parts.add('Premium');
    return parts.join(' · ');
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

class _CardThumbnail extends StatelessWidget {
  const _CardThumbnail({required this.course});

  final Course course;

  @override
  Widget build(BuildContext context) {
    if (!CourseListUtils.hasPreviewMedia(course)) {
      return CoursePlaceholderThumbnail(
        course: course,
        width: CourseCard._thumbWidth,
        height: CourseCard._thumbHeight,
      );
    }

    return ThumbnailImage(
      url: course.thumbnail,
      videoUrl: course.previewVideoUrl,
      width: CourseCard._thumbWidth,
      height: CourseCard._thumbHeight,
      borderRadius: 0,
      fit: BoxFit.cover,
      showMediaOverlay: true,
      mediaOverlayIcon: Icons.play_arrow_rounded,
    );
  }
}
