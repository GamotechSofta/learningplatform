import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../providers/learning_progress_provider.dart';
import '../../providers/notification_provider.dart';
import '../../providers/subscription_provider.dart';
import 'notification_builder.dart';

Future<void> syncNotifications({
  required String userId,
  required NotificationProvider notifications,
  required SubscriptionProvider subs,
  required LearningProgressProvider progress,
}) async {
  final enrolled = subs.activeSubscriptions.map((sub) => sub.course).toList();
  final continueCourse = progress.pickContinueCourse(enrolled);

  int continueWatched = 0;
  int continueTotal = 0;
  DateTime? continueLastAt;
  if (continueCourse != null) {
    continueWatched = progress.watchedCountFor(continueCourse.id);
    continueTotal = progress.totalVideosFor(
      continueCourse.id,
      fallback: continueCourse.videoCount,
    );
    continueLastAt = progress.lastWatchedAt(continueCourse.id);
  }

  await notifications.syncForUser(
    userId: userId,
    input: NotificationBuildInput(
      enrolledCourses: enrolled,
      certificates: progress.certificates,
      continueCourse: continueCourse,
      continueWatchedCount: continueWatched,
      continueTotalCount: continueTotal,
      continueLastWatchedAt: continueLastAt,
      watchedCountFor: progress.watchedCountFor,
      progressForCourse: progress.progressForCourse,
      lastWatchedAtFor: progress.lastWatchedAt,
    ),
  );
}

Future<void> syncUserNotifications(BuildContext context) async {
  final auth = context.read<AuthProvider>();
  if (!auth.isAuthenticated || auth.user == null) return;

  await syncNotifications(
    userId: auth.user!.id,
    notifications: context.read<NotificationProvider>(),
    subs: context.read<SubscriptionProvider>(),
    progress: context.read<LearningProgressProvider>(),
  );
}
