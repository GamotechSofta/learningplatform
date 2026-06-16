import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../models/course.dart';
import '../../providers/learning_progress_provider.dart';
import '../../providers/subscription_provider.dart';
import '../../services/course_service.dart';
import '../../widgets/home/continue_learning_hero.dart';
import 'course_access.dart';

/// Set after login so Home can offer a one-time resume prompt.
class ResumePrompt {
  ResumePrompt._();

  static var pending = false;

  static void markPending() => pending = true;

  static void clear() => pending = false;
}

Future<void> resumeCoursePlayback({
  required BuildContext context,
  required Course course,
  required CourseService courseService,
}) async {
  final subs = context.read<SubscriptionProvider>();
  final progress = context.read<LearningProgressProvider>();
  final subscriptionActive = subs.hasAccess(course.id);

  final rawCourse = await courseService.getCourseFull(
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

  if (!context.mounted) return;

  if (next != null) {
    context.push(
      '/courses/${course.id}/lessons/${next.lessonId}/videos/${next.videoId}',
    );
  } else {
    context.push('/courses/${course.id}');
  }
}

Future<void> maybeShowResumePrompt({
  required BuildContext context,
  required CourseService courseService,
}) async {
  if (!ResumePrompt.pending || !context.mounted) return;
  ResumePrompt.clear();

  final subs = context.read<SubscriptionProvider>();
  final progress = context.read<LearningProgressProvider>();
  final course = progress.pickContinueCourse(
    subs.activeSubscriptions.map((sub) => sub.course).toList(),
  );
  if (course == null || !context.mounted) return;

  await showResumeLearningSheet(
    context: context,
    course: course,
    onResume: () => resumeCoursePlayback(
      context: context,
      course: course,
      courseService: courseService,
    ),
  );
}
