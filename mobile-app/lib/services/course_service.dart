import 'dart:async';

import '../core/api/api_client.dart';
import '../core/cache/app_data_cache.dart';
import '../core/utils/course_playability.dart';
import '../core/utils/course_playlist.dart';
import '../models/course.dart';
import '../models/video_playback_info.dart';

class CourseService {
  CourseService(this._api);

  final ApiClient _api;
  final AppDataCache _cache = AppDataCache.instance;

  static const _publishedKey = 'courses_published';
  static const _playbackTtl = Duration(minutes: 20);

  List<Course> _parsePublishedCourses(List<Map<String, dynamic>> raw) {
    return CoursePlayability.filterListable(
      raw.map(Course.fromJson).toList(),
    );
  }

  Future<List<Course>> getPublishedCoursesFromDisk() async {
    final disk = await _cache.disk();
    final raw = await disk.readList(_publishedKey, AppDataCache.diskMaxAge);
    if (raw == null) return [];
    return _parsePublishedCourses(raw);
  }

  Future<List<Course>> getPublishedCourses({
    String? categoryId,
    bool forceRefresh = false,
  }) async {
    if (forceRefresh) {
      _cache.memory.invalidate(_publishedKey);
      if (categoryId != null) {
        _cache.memory.invalidate('courses_published_$categoryId');
      }
    }

    if (categoryId != null) {
      return _fetchPublishedCourses(
        categoryId: categoryId,
        forceRefresh: forceRefresh,
      );
    }

    try {
      return await _cache.memory.resolve(
        key: _publishedKey,
        ttl: AppDataCache.coursesListTtl,
        forceRefresh: forceRefresh,
        fetch: () => _fetchPublishedCourses(forceRefresh: true),
      );
    } catch (error) {
      if (!forceRefresh) {
        final fromDisk = await getPublishedCoursesFromDisk();
        if (fromDisk.isNotEmpty) return fromDisk;
      }
      rethrow;
    }
  }

  Future<List<Course>> _fetchPublishedCourses({
    String? categoryId,
    bool forceRefresh = false,
  }) async {
    final params = <String, dynamic>{'published': 'true'};
    if (categoryId != null) params['category'] = categoryId;

    final cacheKey = categoryId == null
        ? _publishedKey
        : 'courses_published_$categoryId';

    if (categoryId != null) {
      return _cache.memory.resolve(
        key: cacheKey,
        ttl: AppDataCache.coursesListTtl,
        forceRefresh: forceRefresh,
        fetch: () async {
          final raw = await _api.getRawList('/api/courses', queryParameters: params);
          return _parsePublishedCourses(raw);
        },
      );
    }

    final raw = await _api.getRawList('/api/courses', queryParameters: params);
    await (await _cache.disk()).writeList(_publishedKey, raw);
    return _parsePublishedCourses(raw);
  }

  Course? peekCourseFull(String id) {
    return _cache.memory.peek<Course>(
      'course_full_$id',
      AppDataCache.courseDetailTtl,
    );
  }

  /// Returns memory or disk cache without hitting the network.
  Future<Course?> getCourseFullCached(String id) async {
    final fromMemory = peekCourseFull(id);
    if (fromMemory != null) return fromMemory;

    final disk = await _cache.disk();
    final raw = await disk.readObject('course_full_$id', AppDataCache.diskMaxAge);
    if (raw == null) return null;

    final course = Course.fromJson(raw, includeAllPlayable: true);
    _cache.memory.set('course_full_$id', course);
    return course;
  }

  void prefetchCourseFull(String id) {
    unawaited(getCourseFull(id).then((_) {}, onError: (_) {}));
  }

  void invalidateCourse(String id) {
    _cache.memory.invalidate('course_full_$id');
    invalidateCoursePlayback(id);
  }

  void invalidatePublishedList() {
    _cache.memory.invalidate(_publishedKey);
  }

  void invalidateAllDetails() {
    _cache.memory.invalidatePrefix('course_full_');
    _cache.memory.invalidatePrefix('playback_');
  }

  void invalidateCoursePlayback(String courseId) {
    _cache.memory.invalidatePrefix('playback_${courseId}_');
  }

  String _playbackCacheKey(String courseId, String videoId) =>
      'playback_${courseId}_$videoId';

  Future<Course> getCourseFull(
    String id, {
    bool forceRefresh = false,
  }) async {
    final cacheKey = 'course_full_$id';

    if (forceRefresh) {
      _cache.memory.invalidate(cacheKey);
    }

    try {
      return await _cache.memory.resolve(
        key: cacheKey,
        ttl: AppDataCache.courseDetailTtl,
        forceRefresh: forceRefresh,
        fetch: () async {
          final raw = await _api.getRawObject(
            '/api/courses/$id/full',
            queryParameters: const {'published': 'true'},
          );
          await (await _cache.disk()).writeObject(cacheKey, raw);
          return Course.fromJson(raw, includeAllPlayable: true);
        },
      );
    } catch (error) {
      if (!forceRefresh) {
        final disk = await _cache.disk();
        final raw = await disk.readObject(cacheKey, AppDataCache.diskMaxAge);
        if (raw != null) {
          return Course.fromJson(raw, includeAllPlayable: true);
        }
      }
      rethrow;
    }
  }

  /// Call after a successful purchase so the next video screen has fresh unlock data.
  Future<Course> prepareCourseAfterPurchase(String courseId) {
    invalidateCourse(courseId);
    return getCourseFull(courseId, forceRefresh: true);
  }

  Future<VideoPlaybackInfo> getVideoPlayback(
    String courseId,
    String videoId, {
    bool forceRefresh = false,
  }) async {
    final key = _playbackCacheKey(courseId, videoId);

    if (forceRefresh) {
      _cache.memory.invalidate(key);
    }

    return _cache.memory.resolve(
      key: key,
      ttl: _playbackTtl,
      forceRefresh: forceRefresh,
      fetch: () async {
        try {
          final raw = await _api.getRawObject(
            '/api/courses/$courseId/videos/$videoId/playback',
          );
          return VideoPlaybackInfo.fromJson(raw);
        } catch (_) {
          final course = await getCourseFull(courseId);
          return _playbackFromCourse(course, videoId);
        }
      },
    );
  }

  void prefetchVideoPlayback(String courseId, String videoId) {
    unawaited(
      getVideoPlayback(courseId, videoId).then((_) {}, onError: (_) {}),
    );
  }

  /// Warm first + next video URLs while the user reads the course page.
  void warmCoursePlayback(Course course) {
    final first = firstPlayableVideo(course);
    if (first == null) return;

    prefetchVideoPlayback(course.id, first.video.id);

    final next = nextPlayableVideo(course, first.video.id);
    if (next != null) {
      prefetchVideoPlayback(course.id, next.video.id);
    }
  }

  VideoPlaybackInfo _playbackFromCourse(Course course, String videoId) {
    for (final lesson in course.lessons) {
      for (final video in lesson.videos) {
        if (video.id == videoId) {
          return VideoPlaybackInfo(
            id: video.id,
            title: video.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            videoUrl: video.videoUrl,
            hlsUrl: video.hlsUrl ?? '',
            thumbnail: video.thumbnail,
            duration: video.duration,
            isLocked: video.isLocked,
          );
        }
      }
    }
    throw Exception('Video not found in this course');
  }
}
