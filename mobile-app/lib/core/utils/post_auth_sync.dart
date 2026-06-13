import '../../providers/auth_provider.dart';
import '../../providers/learning_progress_provider.dart';
import '../../providers/notification_provider.dart';
import '../../providers/saved_courses_provider.dart';
import '../../providers/subscription_provider.dart';
import 'notification_sync.dart';

/// Loads user-specific data after sign-in without failing auth if one call errors.
Future<void> syncUserDataAfterAuth({
  required AuthProvider auth,
  required SubscriptionProvider subs,
  required LearningProgressProvider progress,
  required NotificationProvider notifications,
  required SavedCoursesProvider saved,
}) async {
  final user = auth.user;
  if (user == null || user.id.isEmpty) return;

  await Future.wait([
    subs.refresh(user.id).catchError((_) {}),
    progress.loadForUser(user.id).catchError((_) {}),
    saved.loadForUser(user.id).catchError((_) {}),
    notifications.loadForUser(user.id).catchError((_) {}),
  ]);

  try {
    await syncNotifications(
      userId: user.id,
      notifications: notifications,
      subs: subs,
      progress: progress,
    );
  } catch (_) {}
}
