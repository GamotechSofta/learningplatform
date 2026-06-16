import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../models/certificate.dart';
import '../models/course.dart';
import '../services/learning_progress_service.dart';

class LearningProgressProvider extends ChangeNotifier {
  LearningProgressProvider(this._service);

  final LearningProgressService _service;

  String? _userId;
  Map<String, List<String>> _progress = {};
  Map<String, int> _courseTotals = {};
  Map<String, Map<String, dynamic>> _courseMeta = {};
  List<CourseCertificate> _certificates = [];

  List<CourseCertificate> get certificates => List.unmodifiable(_certificates);

  Future<void> loadForUser(String userId) async {
    _userId = userId;
    _progress = await _service.getProgress(userId);
    _courseTotals = await _service.getCourseTotals(userId);
    _courseMeta = await _service.getCourseMeta(userId);
    _certificates = await _service.getCertificates(userId);
    notifyListeners();
  }

  void clear() {
    _userId = null;
    _progress = {};
    _courseTotals = {};
    _courseMeta = {};
    _certificates = [];
    notifyListeners();
  }

  List<String> watchedVideoIds(String courseId) =>
      List.unmodifiable(_progress[courseId] ?? const []);

  int totalVideosFor(String courseId, {int fallback = 0}) =>
      _courseTotals[courseId] ?? fallback;

  int watchedCountFor(String courseId) => _progress[courseId]?.length ?? 0;

  double progressForCourse(String courseId, int totalVideos) {
    final total = totalVideosFor(courseId, fallback: totalVideos);
    if (total <= 0) return 0;
    return (watchedCountFor(courseId) / total).clamp(0.0, 1.0);
  }

  Course? pickContinueCourse(List<Course> purchasedCourses) {
    if (purchasedCourses.isEmpty) return null;

    Course? best;
    DateTime? latestActivity;

    for (final course in purchasedCourses) {
      final total = totalVideosFor(course.id, fallback: course.videoCount);
      if (total > 0 && progressForCourse(course.id, course.videoCount) >= 1.0) {
        continue;
      }

      final lastAt = lastWatchedAt(course.id);
      final watched = watchedCountFor(course.id);
      if (watched == 0) continue;

      if (best == null ||
          (lastAt != null && (latestActivity == null || lastAt.isAfter(latestActivity)))) {
        best = course;
        latestActivity = lastAt;
      }
    }

    if (best != null) return best;

    for (final course in purchasedCourses) {
      final total = totalVideosFor(course.id, fallback: course.videoCount);
      if (total == 0 || progressForCourse(course.id, course.videoCount) < 1.0) {
        return course;
      }
    }

    return null;
  }

  ({String lessonId, String videoId})? nextVideoToWatch(
    Course course, {
    required bool isPurchased,
  }) {
    final watched = _progress[course.id] ?? const <String>[];

    for (final lesson in course.lessons) {
      for (final video in lesson.videos) {
        if (video.isLocked) continue;
        if (!watched.contains(video.id)) {
          return (lessonId: lesson.id, videoId: video.id);
        }
      }
    }

    for (final lesson in course.lessons) {
      for (final video in lesson.videos) {
        if (!video.isLocked) {
          return (lessonId: lesson.id, videoId: video.id);
        }
      }
    }

    return null;
  }

  DateTime? lastWatchedAt(String courseId) {
    final raw = _courseMeta[courseId]?['lastWatchedAt']?.toString();
    return raw == null ? null : DateTime.tryParse(raw);
  }

  bool isVideoWatched(String courseId, String videoId) =>
      _progress[courseId]?.contains(videoId) ?? false;

  bool isCourseComplete(Course course, {required bool isPurchased}) {
    final playableIds = _playableVideoIds(course, isPurchased);
    if (playableIds.isEmpty) return false;
    final watched = _progress[course.id] ?? const [];
    return playableIds.every(watched.contains);
  }

  CourseCertificate? certificateForCourse(String courseId) {
    try {
      return _certificates.firstWhere((cert) => cert.courseId == courseId);
    } catch (_) {
      return null;
    }
  }

  Future<void> ensureCourseTotal({
    required String userId,
    required String courseId,
    required int totalVideos,
  }) async {
    if (totalVideos <= 0) return;
    if (_userId != userId) await loadForUser(userId);
    if ((_courseTotals[courseId] ?? 0) > 0) return;

    _courseTotals[courseId] = totalVideos;
    await _service.saveCourseTotals(userId, _courseTotals);
    notifyListeners();
  }

  Future<CourseCertificate?> markVideoWatched({
    required String userId,
    required Course course,
    required String lessonId,
    required String videoId,
    required bool isPurchased,
    required String studentName,
  }) async {
    if (_userId != userId) await loadForUser(userId);

    final playableCount = _playableVideoIds(course, isPurchased).length;
    if (playableCount > 0) {
      _courseTotals[course.id] = playableCount;
      await _service.saveCourseTotals(userId, _courseTotals);
    }

    final watched = List<String>.from(_progress[course.id] ?? []);
    if (!watched.contains(videoId)) watched.add(videoId);
    _progress[course.id] = watched;
    _courseMeta[course.id] = {
      'lastLessonId': lessonId,
      'lastVideoId': videoId,
      'lastWatchedAt': DateTime.now().toIso8601String(),
    };
    await _service.saveProgress(userId, _progress);
    await _service.saveCourseMeta(userId, _courseMeta);

    CourseCertificate? issued;
    if (isCourseComplete(course, isPurchased: isPurchased) &&
        certificateForCourse(course.id) == null &&
        _canEarnCertificate(course, isPurchased)) {
      issued = await _issueCertificate(
        userId: userId,
        course: course,
        studentName: studentName,
      );
    }

    notifyListeners();
    return issued;
  }

  bool _canEarnCertificate(Course course, bool isPurchased) {
    if (course.isPaid && !isPurchased) return false;
    return true;
  }

  List<String> _playableVideoIds(Course course, bool isPurchased) {
    if (course.isPaid && !isPurchased) {
      final first = course.lessons
          .expand((lesson) => lesson.videos)
          .where((video) => video.hasPlayableSource)
          .map((video) => video.id)
          .firstOrNull;
      return first == null ? [] : [first];
    }

    return course.lessons
        .expand((lesson) => lesson.videos)
        .where((video) => video.hasPlayableSource)
        .map((video) => video.id)
        .toList();
  }

  Future<CourseCertificate> _issueCertificate({
    required String userId,
    required Course course,
    required String studentName,
  }) async {
    final now = DateTime.now();
    final certificate = CourseCertificate(
      id: 'cert_${course.id}_${now.millisecondsSinceEpoch}',
      courseId: course.id,
      courseTitle: course.title,
      studentName: studentName,
      issuedAt: now,
      certificateNumber: _generateCertificateNumber(now),
      instructorName: course.instructorName,
      organization: AppConfig.appName,
      totalVideos: course.videoCount,
    );

    _certificates = [certificate, ..._certificates];
    await _service.saveCertificates(userId, _certificates);
    return certificate;
  }

  String _generateCertificateNumber(DateTime date) {
    final stamp = '${date.year}${date.month.toString().padLeft(2, '0')}${date.day.toString().padLeft(2, '0')}';
    final suffix = date.millisecondsSinceEpoch % 100000;
    return 'VID-$stamp-${suffix.toString().padLeft(5, '0')}';
  }
}
