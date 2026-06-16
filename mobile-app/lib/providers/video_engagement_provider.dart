import 'dart:io';

import 'package:flutter/foundation.dart';

import '../services/video_download_service.dart';
import '../services/video_engagement_service.dart';

class VideoEngagementProvider extends ChangeNotifier {
  VideoEngagementProvider(this._engagementService, this._downloadService);

  final VideoEngagementService _engagementService;
  final VideoDownloadService _downloadService;

  String? _userId;
  VideoEngagementData _data = const VideoEngagementData();
  final Map<String, double> _downloadProgress = {};
  final Set<String> _downloading = {};

  String? reactionFor(String videoId) => _data.reactions[videoId];

  bool isLiked(String videoId) => _data.reactions[videoId] == 'like';
  bool isDisliked(String videoId) => _data.reactions[videoId] == 'dislike';
  bool isDownloaded(String videoId) => _data.downloads.containsKey(videoId);
  bool isDownloading(String videoId) => _downloading.contains(videoId);
  double? downloadProgressFor(String videoId) => _downloadProgress[videoId];

  VideoDownloadRecord? downloadFor(String videoId) => _data.downloads[videoId];

  int get downloadCount => _data.downloads.length;

  List<VideoDownloadRecord> get allDownloads {
    final items = _data.downloads.values.toList()
      ..sort((a, b) => b.downloadedAt.compareTo(a.downloadedAt));
    return items;
  }

  Future<void> refreshDownloads(String userId) async {
    await loadForUser(userId);

    final onDisk = await _downloadService.scanDownloadedFiles();
    final downloads = Map<String, VideoDownloadRecord>.from(_data.downloads);

    for (final entry in downloads.entries.toList()) {
      final file = File(entry.value.localPath);
      if (!await file.exists() || await file.length() <= 0) {
        downloads.remove(entry.key);
      }
    }

    for (final file in onDisk) {
      final existing = downloads[file.videoId];
      if (existing != null) {
        if (!await File(existing.localPath).exists()) {
          downloads[file.videoId] = VideoDownloadRecord(
            videoId: existing.videoId,
            courseId: existing.courseId,
            title: existing.title,
            localPath: file.localPath,
            downloadedAt: existing.downloadedAt,
            lessonId: existing.lessonId,
            courseTitle: existing.courseTitle,
          );
        }
        continue;
      }

      downloads[file.videoId] = VideoDownloadRecord(
        videoId: file.videoId,
        courseId: file.courseId,
        title: 'Downloaded video',
        localPath: file.localPath,
        downloadedAt: file.modifiedAt,
      );
    }

    _data = _data.copyWith(downloads: downloads);
    await _engagementService.save(userId, _data);
    notifyListeners();
  }

  Future<void> loadForUser(String userId) async {
    _userId = userId;
    _data = await _engagementService.load(userId);
    notifyListeners();
  }

  void clear() {
    _userId = null;
    _data = const VideoEngagementData();
    _downloadProgress.clear();
    _downloading.clear();
    notifyListeners();
  }

  Future<void> toggleLike(String userId, String videoId) async {
    await _ensureUser(userId);
    final reactions = Map<String, String>.from(_data.reactions);
    if (reactions[videoId] == 'like') {
      reactions.remove(videoId);
    } else {
      reactions[videoId] = 'like';
    }
    await _persist(reactions: reactions);
  }

  Future<void> toggleDislike(String userId, String videoId) async {
    await _ensureUser(userId);
    final reactions = Map<String, String>.from(_data.reactions);
    if (reactions[videoId] == 'dislike') {
      reactions.remove(videoId);
    } else {
      reactions[videoId] = 'dislike';
    }
    await _persist(reactions: reactions);
  }

  Future<void> downloadVideo({
    required String userId,
    required String courseId,
    required String videoId,
    required String title,
    required String playbackUrl,
    String? lessonId,
    String? courseTitle,
  }) async {
    if (playbackUrl.isEmpty) {
      throw Exception('This video is not available for download.');
    }

    await _ensureUser(userId);

    if (isDownloaded(videoId)) return;
    if (_downloading.contains(videoId)) return;

    _downloading.add(videoId);
    _downloadProgress[videoId] = 0;
    notifyListeners();

    try {
      final localPath = await _downloadService.download(
        url: playbackUrl,
        courseId: courseId,
        videoId: videoId,
        onProgress: (progress) {
          _downloadProgress[videoId] = progress;
          notifyListeners();
        },
      );

      final downloads = Map<String, VideoDownloadRecord>.from(_data.downloads);
      downloads[videoId] = VideoDownloadRecord(
        videoId: videoId,
        courseId: courseId,
        title: title,
        localPath: localPath,
        downloadedAt: DateTime.now(),
        lessonId: lessonId,
        courseTitle: courseTitle,
      );
      await _persist(downloads: downloads);
    } finally {
      _downloading.remove(videoId);
      _downloadProgress.remove(videoId);
      notifyListeners();
    }
  }

  Future<void> removeDownload(String userId, String videoId) async {
    await _ensureUser(userId);
    final record = _data.downloads[videoId];
    if (record == null) return;

    await _downloadService.deleteFile(record.localPath);
    final downloads = Map<String, VideoDownloadRecord>.from(_data.downloads);
    downloads.remove(videoId);
    await _persist(downloads: downloads);
  }

  Future<void> _ensureUser(String userId) async {
    if (_userId != userId) await loadForUser(userId);
  }

  Future<void> _persist({
    Map<String, String>? reactions,
    Map<String, VideoDownloadRecord>? downloads,
  }) async {
    final userId = _userId;
    if (userId == null) return;

    _data = _data.copyWith(
      reactions: reactions,
      downloads: downloads,
    );
    await _engagementService.save(userId, _data);
    notifyListeners();
  }
}
