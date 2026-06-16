import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
import '../models/course.dart';

/// Fallback tile when a course has no thumbnail or preview video.
class CoursePlaceholderThumbnail extends StatelessWidget {
  const CoursePlaceholderThumbnail({
    super.key,
    required this.course,
    required this.width,
    required this.height,
  });

  final Course course;
  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final initial = course.title.trim().isNotEmpty
        ? course.title.trim()[0].toUpperCase()
        : '?';

    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            c.primaryTint,
            c.surfaceElevated,
          ],
        ),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.12),
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.25),
                ),
              ),
              alignment: Alignment.center,
              child: Text(
                initial,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Icon(
              Icons.menu_book_rounded,
              size: 18,
              color: c.textSecondary.withValues(alpha: 0.8),
            ),
          ],
        ),
      ),
    );
  }
}
