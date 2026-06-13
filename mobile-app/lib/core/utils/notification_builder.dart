import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_colors.dart';
import '../../models/app_notification.dart';
import '../../models/certificate.dart';
import '../../models/course.dart';

class NotificationBuildInput {
  const NotificationBuildInput({
    required this.enrolledCourses,
    required this.certificates,
    this.continueCourse,
    this.continueWatchedCount = 0,
    this.continueTotalCount = 0,
    this.continueLastWatchedAt,
    this.watchedCountFor,
    this.progressForCourse,
    this.lastWatchedAtFor,
  });

  final List<Course> enrolledCourses;
  final List<CourseCertificate> certificates;
  final Course? continueCourse;
  final int continueWatchedCount;
  final int continueTotalCount;
  final DateTime? continueLastWatchedAt;
  final int Function(String courseId)? watchedCountFor;
  final double Function(String courseId, int totalVideos)? progressForCourse;
  final DateTime? Function(String courseId)? lastWatchedAtFor;
}

class NotificationBuilder {
  NotificationBuilder._();

  static List<AppNotification> build(
    NotificationBuildInput input, {
    required Set<String> readIds,
  }) {
    final notifications = <AppNotification>[];

    final continueCourse = input.continueCourse;
    if (continueCourse != null && input.continueWatchedCount > 0) {
      final total = input.continueTotalCount > 0
          ? input.continueTotalCount
          : continueCourse.videoCount;
      final percent = total > 0
          ? ((input.continueWatchedCount / total) * 100).round()
          : 0;

      notifications.add(
        AppNotification(
          id: 'continue:${continueCourse.id}',
          icon: Icons.play_circle_outline,
          color: AppColors.primary,
          title: 'Continue learning',
          body: total > 0
              ? 'You are $percent% through "${continueCourse.title}". Pick up where you left off.'
              : 'Resume "${continueCourse.title}" from your last lesson.',
          occurredAt: input.continueLastWatchedAt ?? DateTime.now(),
          route: '/courses/${continueCourse.id}',
          isRead: readIds.contains('continue:${continueCourse.id}'),
        ),
      );
    }

    final sortedCerts = [...input.certificates]
      ..sort((a, b) => b.issuedAt.compareTo(a.issuedAt));
    for (final certificate in sortedCerts) {
      notifications.add(
        AppNotification(
          id: 'certificate:${certificate.courseId}',
          icon: Icons.workspace_premium_outlined,
          color: const Color(0xFF7C3AED),
          title: 'Certificate earned',
          body:
              'You completed "${certificate.courseTitle}". Your certificate is ready to view.',
          occurredAt: certificate.issuedAt,
          route: '/certificates/${certificate.id}',
          isRead: readIds.contains('certificate:${certificate.courseId}'),
        ),
      );
    }

    final watchedCountFor = input.watchedCountFor ?? (_) => 0;
    final progressFor = input.progressForCourse ?? (_, __) => 0.0;

    final notStarted = input.enrolledCourses.where((course) {
      if (continueCourse?.id == course.id) return false;
      if (input.certificates.any((cert) => cert.courseId == course.id)) {
        return false;
      }
      final watched = watchedCountFor(course.id);
      if (watched > 0) return false;
      return progressFor(course.id, course.videoCount) < 1.0;
    }).toList();

    for (final course in notStarted.take(3)) {
      notifications.add(
        AppNotification(
          id: 'enrolled:${course.id}',
          icon: Icons.school_outlined,
          color: const Color(0xFF059669),
          title: 'Course ready to start',
          body: course.videoCount > 0
              ? 'You have access to "${course.title}" with ${course.videoCount} lessons. Start your first video.'
              : 'You have access to "${course.title}". Open the course to begin.',
          occurredAt: DateTime.now(),
          route: '/courses/${course.id}',
          isRead: readIds.contains('enrolled:${course.id}'),
        ),
      );
    }

    final inProgress = input.enrolledCourses.where((course) {
      if (continueCourse?.id == course.id) return false;
      final watched = watchedCountFor(course.id);
      if (watched == 0) return false;
      return progressFor(course.id, course.videoCount) < 1.0;
    }).toList();

    final lastWatchedAtFor = input.lastWatchedAtFor;
    for (final course in inProgress.take(2)) {
      final watched = watchedCountFor(course.id);
      final total = course.videoCount;
      final percent = total > 0 ? ((watched / total) * 100).round() : 0;

      notifications.add(
        AppNotification(
          id: 'progress:${course.id}',
          icon: Icons.timelapse_rounded,
          color: const Color(0xFF0EA5E9),
          title: 'Course in progress',
          body: total > 0
              ? '$percent% complete on "${course.title}" ($watched of $total lessons).'
              : 'You have started "${course.title}". Keep going!',
          occurredAt: lastWatchedAtFor?.call(course.id) ?? DateTime.now(),
          route: '/courses/${course.id}',
          isRead: readIds.contains('progress:${course.id}'),
        ),
      );
    }

    notifications.sort((a, b) => b.occurredAt.compareTo(a.occurredAt));
    return notifications;
  }

  static String formatRelativeTime(DateTime dateTime) {
    final now = DateTime.now();
    final diff = now.difference(dateTime);

    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
    if (diff.inHours < 24) {
      return diff.inHours == 1 ? '1 hour ago' : '${diff.inHours} hours ago';
    }
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    return DateFormat('d MMM yyyy').format(dateTime);
  }
}
