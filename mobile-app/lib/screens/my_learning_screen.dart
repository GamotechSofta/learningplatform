import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
import '../core/utils/course_access.dart';
import '../models/course.dart';
import '../providers/auth_provider.dart';
import '../providers/learning_progress_provider.dart';
import '../providers/subscription_provider.dart';
import '../services/course_service.dart';
import '../services/subscription_service.dart' show SubscriptionService, UserSubscription;
import '../widgets/empty_state.dart';
import '../widgets/home/continue_learning_tile.dart';

class MyLearningScreen extends StatefulWidget {
  const MyLearningScreen({
    super.key,
    required this.subscriptionService,
    required this.courseService,
  });

  final SubscriptionService subscriptionService;
  final CourseService courseService;

  @override
  State<MyLearningScreen> createState() => _MyLearningScreenState();
}

class _MyLearningScreenState extends State<MyLearningScreen> {
  int _tabIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _refresh());
  }

  Future<void> _refresh() async {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated || auth.user == null) return;

    await Future.wait([
      context.read<SubscriptionProvider>().refresh(
            auth.user!.id,
            forceRefresh: true,
          ),
      context.read<LearningProgressProvider>().loadForUser(auth.user!.id),
    ]);

    if (!mounted) return;

    final subs = context.read<SubscriptionProvider>();
    final progress = context.read<LearningProgressProvider>();
    for (final sub in subs.activeSubscriptions) {
      final count = sub.course.videoCount;
      if (count > 0) {
        await progress.ensureCourseTotal(
          userId: auth.user!.id,
          courseId: sub.course.id,
          totalVideos: count,
        );
      }
    }
  }

  Future<void> _resumeCourse(Course course) async {
    try {
      final subs = context.read<SubscriptionProvider>();
      final progress = context.read<LearningProgressProvider>();
      final subscriptionActive = subs.hasAccess(course.id);

      final rawCourse = await widget.courseService.getCourseFull(
        course.id,
        forceRefresh: subscriptionActive,
      );
      final isPurchased = CourseAccess.isCoursePurchased(
        rawCourse,
        subscriptionActive: subscriptionActive,
      );
      final fullCourse = CourseAccess.applyPlaybackLocks(
        rawCourse,
        subscriptionActive: subscriptionActive,
      );
      final next = progress.nextVideoToWatch(
        fullCourse,
        isPurchased: isPurchased,
      );

      if (!mounted) return;

      if (next != null) {
        context.push(
          '/courses/${course.id}/lessons/${next.lessonId}/videos/${next.videoId}',
        );
      } else {
        context.push('/courses/${course.id}');
      }
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final auth = context.watch<AuthProvider>();

    if (!auth.isAuthenticated) {
      return Scaffold(
        backgroundColor: c.background,
        body: SafeArea(
          child: EmptyState(
            title: 'Sign in to view your learning',
            subtitle: 'Track purchased courses and resume where you left off.',
            icon: Icons.play_lesson_outlined,
          ),
        ),
      );
    }

    final subs = context.watch<SubscriptionProvider>();
    final progress = context.watch<LearningProgressProvider>();
    final purchased = subs.activeSubscriptions;

    final inProgress = purchased.where((sub) {
      final course = sub.course;
      return progress.progressForCourse(course.id, course.videoCount) < 1.0;
    }).toList();

    final completed = purchased.where((sub) {
      final course = sub.course;
      return progress.progressForCourse(course.id, course.videoCount) >= 1.0 ||
          progress.certificateForCourse(course.id) != null;
    }).toList();

    final activeList = _tabIndex == 0 ? inProgress : completed;

    return Scaffold(
      backgroundColor: c.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Text(
                'My Learning',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: c.textPrimary,
                ),
              ),
            ),
            SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: c.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: c.border),
                ),
                child: Row(
                  children: [
                    _LearningTab(
                      label: 'In Progress',
                      selected: _tabIndex == 0,
                      onTap: () => setState(() => _tabIndex = 0),
                    ),
                    _LearningTab(
                      label: 'Completed',
                      selected: _tabIndex == 1,
                      onTap: () => setState(() => _tabIndex = 1),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: subs.loading
                  ? const Center(child: CircularProgressIndicator())
                  : _CourseList(
                      items: activeList,
                      progress: progress,
                      emptyTitle: _tabIndex == 0
                          ? 'No courses in progress'
                          : 'No completed courses',
                      emptySubtitle: _tabIndex == 0
                          ? 'Purchase a course and start learning.'
                          : 'Finish all videos to complete a course.',
                      onResume: _resumeCourse,
                      onRefresh: _refresh,
                      isCompleted: _tabIndex == 1,
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LearningTab extends StatelessWidget {
  const _LearningTab({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: selected ? AppColors.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 13,
              color: selected ? Colors.white : c.textSecondary,
            ),
          ),
        ),
      ),
    );
  }
}

class _CourseList extends StatelessWidget {
  const _CourseList({
    required this.items,
    required this.progress,
    required this.emptyTitle,
    required this.emptySubtitle,
    required this.onResume,
    required this.onRefresh,
    this.isCompleted = false,
  });

  final List<UserSubscription> items;
  final LearningProgressProvider progress;
  final String emptyTitle;
  final String emptySubtitle;
  final Future<void> Function(Course course) onResume;
  final Future<void> Function() onRefresh;
  final bool isCompleted;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return ListView(
        children: [
          const SizedBox(height: 60),
          EmptyState(
            title: emptyTitle,
            subtitle: emptySubtitle,
            icon: Icons.menu_book_outlined,
          ),
        ],
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.only(bottom: 24),
        children: items.map((sub) {
          final course = sub.course;
          final totalCount = progress.totalVideosFor(course.id, fallback: course.videoCount);
          final watchedCount = progress.watchedCountFor(course.id);
          final courseProgress = progress.progressForCourse(course.id, course.videoCount);

          return Padding(
            padding: const EdgeInsets.only(bottom: 14),
            child: ContinueLearningTile(
              course: course,
              progress: isCompleted ? 1.0 : courseProgress,
              watchedCount: isCompleted ? totalCount : watchedCount,
              totalCount: totalCount > 0 ? totalCount : null,
              resumeLabel: isCompleted ? 'Review' : (watchedCount > 0 ? 'Resume' : 'Start'),
              onResume: () => onResume(course),
            ),
          );
        }).toList(),
      ),
    );
  }
}
