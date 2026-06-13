import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../models/course.dart';
import '../providers/auth_provider.dart';
import '../providers/saved_courses_provider.dart';

class SaveCourseButton extends StatelessWidget {
  const SaveCourseButton({
    super.key,
    required this.course,
    this.iconSize = 20,
    this.padding = const EdgeInsets.all(6),
    this.filledBackground = true,
  });

  final Course course;
  final double iconSize;
  final EdgeInsets padding;
  final bool filledBackground;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final saved = context.watch<SavedCoursesProvider>();
    final isSaved = saved.isSaved(course.id);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: auth.isAuthenticated
            ? () => _toggle(context, auth.user!.id)
            : () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Sign in to save courses'),
                  ),
                );
              },
        customBorder: const CircleBorder(),
        child: filledBackground
            ? Container(
                padding: padding,
                decoration: BoxDecoration(
                  color: AppColors.surface.withValues(alpha: 0.95),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isSaved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                  size: iconSize,
                  color: isSaved ? AppColors.primary : AppColors.textSecondary,
                ),
              )
            : Padding(
                padding: padding,
                child: Icon(
                  isSaved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                  size: iconSize,
                  color: isSaved ? AppColors.primary : AppColors.textSecondary,
                ),
              ),
      ),
    );
  }

  Future<void> _toggle(BuildContext context, String userId) async {
    final saved = context.read<SavedCoursesProvider>();
    final added = await saved.toggle(course, userId);
    if (!context.mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          added ? 'Course saved' : 'Removed from saved courses',
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }
}
