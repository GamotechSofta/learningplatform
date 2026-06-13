import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../providers/auth_provider.dart';
import '../providers/saved_courses_provider.dart';
import '../widgets/course_card.dart';
import '../widgets/empty_state.dart';

class SavedCoursesScreen extends StatelessWidget {
  const SavedCoursesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final saved = context.watch<SavedCoursesProvider>();

    if (!auth.isAuthenticated) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: EmptyState(
            title: 'Sign in to view saved courses',
            subtitle: 'Bookmark courses from the home page to find them here later.',
            icon: Icons.bookmark_border_rounded,
          ),
        ),
      );
    }

    final courses = saved.courses;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: courses.isEmpty
            ? const EmptyState(
                title: 'No saved courses yet',
                subtitle: 'Tap the bookmark icon on any course to save it here.',
                icon: Icons.bookmark_border_rounded,
              )
            : ListView(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
                children: [
                  const Text(
                    'Saved Courses',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${courses.length} saved',
                    style: const TextStyle(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 20),
                  ...courses.map(
                    (course) => Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: CourseCard(
                        course: course,
                        onTap: () => context.push('/courses/${course.id}'),
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
