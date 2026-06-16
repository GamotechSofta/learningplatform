import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/themed_colors.dart';
import '../../models/course.dart';
import '../save_course_button.dart';
import '../thumbnail_image.dart';
import '../course_rating_stars.dart';

class TrendingCourseTile extends StatelessWidget {
  const TrendingCourseTile({
    super.key,
    required this.course,
    required this.onTap,
  });

  final Course course;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final price = _formatPrice(course);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 220,
        margin: const EdgeInsets.only(right: 14),
        decoration: BoxDecoration(
          color: c.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: c.border),
          boxShadow: [
            BoxShadow(color: c.cardShadow,
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ThumbnailImage(
                  url: course.thumbnail,
                  videoUrl: course.previewVideoUrl,
                  height: 110,
                  borderRadius: 0,
                  showMediaOverlay: true,
                  icon: Icons.play_circle_outline,
                ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: SaveCourseButton(
                    course: course,
                    iconSize: 18,
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    course.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: c.textPrimary,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 6),
                  CourseRatingStars(course: course),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      if (course.videoCount > 0) ...[
                        Icon(
                          Icons.play_circle_outline,
                          size: 15,
                          color: c.textSecondary,
                        ),
                        SizedBox(width: 4),
                        Text(
                          '${course.videoCount} lessons',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: c.textSecondary,
                          ),
                        ),
                      ],
                      const Spacer(),
                      Text(
                        price,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
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
    );
  }

  String _formatPrice(Course course) {
    final p = course.pricing;
    if (p.lifetime > 0) return '₹${p.lifetime.toStringAsFixed(0)}';
    if (p.yearly > 0) return '₹${p.yearly.toStringAsFixed(0)}';
    if (p.monthly > 0) return '₹${p.monthly.toStringAsFixed(0)}';
    return 'Free';
  }
}
