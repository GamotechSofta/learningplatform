import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../models/course.dart';
import '../course_side_thumbnail.dart';

class ContinueLearningTile extends StatelessWidget {
  const ContinueLearningTile({
    super.key,
    required this.course,
    required this.progress,
    required this.onResume,
    this.watchedCount,
    this.totalCount,
    this.resumeLabel = 'Resume',
  });

  final Course course;
  final double progress;
  final VoidCallback onResume;
  final int? watchedCount;
  final int? totalCount;
  final String resumeLabel;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: CourseSideThumbnail(
              course: course,
              width: 96,
              height: 72,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
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
                  ),
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(99),
                  child: LinearProgressIndicator(
                    value: progress.clamp(0.0, 1.0),
                    minHeight: 6,
                    backgroundColor: AppColors.border,
                    color: AppColors.accentGreen,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  _progressLabel(),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.accentGreen,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          FilledButton(
            onPressed: onResume,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              minimumSize: Size.zero,
            ),
            child: Text(resumeLabel),
          ),
        ],
      ),
    );
  }

  String _progressLabel() {
    if (totalCount != null && totalCount! > 0) {
      final watched = watchedCount ?? (progress * totalCount!).round();
      if (progress >= 1.0) return 'Completed • $watched of $totalCount videos';
      return '${(progress * 100).round()}% Completed • $watched/$totalCount videos';
    }

    if (progress <= 0) return 'Not started yet';
    if (progress >= 1.0) return 'Completed';
    return '${(progress * 100).round()}% Completed';
  }
}
