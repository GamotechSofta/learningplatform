import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/themed_colors.dart';
import '../../models/course.dart';
import '../course_side_thumbnail.dart';

class ContinueLearningHero extends StatelessWidget {
  const ContinueLearningHero({
    super.key,
    required this.course,
    required this.progress,
    required this.onResume,
    this.watchedCount,
    this.totalCount,
  });

  final Course course;
  final double progress;
  final VoidCallback onResume;
  final int? watchedCount;
  final int? totalCount;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final percent = (progress * 100).round();

    final isDark = context.isDarkTheme;
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 8, 20, 0),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? [c.primaryTint, c.surfaceElevated]
              : [
                  AppColors.primary.withValues(alpha: 0.14),
                  c.surface,
                ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark
              ? c.primaryTintBorder
              : AppColors.primary.withValues(alpha: 0.25),
        ),
        boxShadow: [
          BoxShadow(color: c.glowShadow,
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.play_circle_filled_rounded, color: AppColors.primary, size: 22),
                SizedBox(width: 8),
                Text(
                  'Continue learning',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: c.textSecondary,
                    letterSpacing: 0.3,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: c.primaryTint,
                    borderRadius: BorderRadius.circular(99),
                  ),
                  child: Text(
                    '$percent%',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: CourseSideThumbnail(
                    course: course,
                    width: 112,
                    height: 72,
                  ),
                ),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        course.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: c.textPrimary,
                          height: 1.25,
                        ),
                      ),
                      SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(99),
                        child: LinearProgressIndicator(
                          value: progress.clamp(0.0, 1.0),
                          minHeight: 7,
                          backgroundColor: c.border,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _label(),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: onResume,
                icon: const Icon(Icons.play_arrow_rounded),
                label: Text(watchedCount != null && watchedCount! > 0 ? 'Resume' : 'Start course'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _label() {
    if (totalCount != null && totalCount! > 0) {
      final watched = watchedCount ?? (progress * totalCount!).round();
      return '$watched of $totalCount videos watched';
    }
    return progress >= 1.0 ? 'Course completed' : 'Keep your streak going';
  }
}

Future<void> showResumeLearningSheet({
  required BuildContext context,
  required Course course,
  required Future<void> Function() onResume,
}) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (sheetContext) {
      final c = sheetContext.colors;
      return Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        decoration: BoxDecoration(
          color: c.surface,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome back!',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: c.textPrimary,
              ),
            ),
            SizedBox(height: 6),
            Text(
              'Pick up where you left off in ${course.title}.',
              style: TextStyle(
                color: c.textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 140,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: CourseSideThumbnail(course: course, width: double.infinity, height: 140),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(sheetContext).pop(),
                    child: const Text('Browse'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: FilledButton.icon(
                    onPressed: () async {
                      Navigator.of(sheetContext).pop();
                      await onResume();
                    },
                    icon: const Icon(Icons.play_arrow_rounded),
                    label: const Text('Resume'),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    },
  );
}
