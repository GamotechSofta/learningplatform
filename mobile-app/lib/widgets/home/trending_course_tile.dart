import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../models/course.dart';
import '../save_course_button.dart';
import '../thumbnail_image.dart';

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
    final price = _formatPrice(course);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 220,
        margin: const EdgeInsets.only(right: 14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
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
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      if (course.videoCount > 0) ...[
                        const Icon(
                          Icons.play_circle_outline,
                          size: 15,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${course.videoCount} lessons',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary,
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
