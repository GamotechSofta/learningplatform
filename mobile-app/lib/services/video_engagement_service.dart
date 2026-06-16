import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../core/storage/secure_storage.dart';

class VideoDownloadRecord {
  const VideoDownloadRecord({
    required this.videoId,
    required this.courseId,
    required this.title,
    required this.localPath,
    required this.downloadedAt,
    this.lessonId,
    this.courseTitle,
  });

  final String videoId;
  final String courseId;
  final String title;
  final String localPath;
  final DateTime downloadedAt;
  final String? lessonId;
  final String? courseTitle;

  factory VideoDownloadRecord.fromJson(Map<String, dynamic> json) {
    return VideoDownloadRecord(
      videoId: json['videoId']?.toString() ?? '',
      courseId: json['courseId']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Video',
      localPath: json['localPath']?.toString() ?? '',
      downloadedAt: DateTime.tryParse(json['downloadedAt']?.toString() ?? '') ??
          DateTime.now(),
      lessonId: json['lessonId']?.toString(),
      courseTitle: json['courseTitle']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'videoId': videoId,
        'courseId': courseId,
        'title': title,
        'localPath': localPath,
        'downloadedAt': downloadedAt.toIso8601String(),
        if (lessonId != null && lessonId!.isNotEmpty) 'lessonId': lessonId,
        if (courseTitle != null && courseTitle!.isNotEmpty)
          'courseTitle': courseTitle,
      };
}

class VideoEngagementData {
  const VideoEngagementData({
    this.reactions = const {},
    this.downloads = const {},
  });

  final Map<String, String> reactions;
  final Map<String, VideoDownloadRecord> downloads;

  VideoEngagementData copyWith({
    Map<String, String>? reactions,
    Map<String, VideoDownloadRecord>? downloads,
  }) {
    return VideoEngagementData(
      reactions: reactions ?? this.reactions,
      downloads: downloads ?? this.downloads,
    );
  }
}

class VideoEngagementService {
  VideoEngagementService({FlutterSecureStorage? storage})
      : _storage = storage ?? createSecureStorage();

  final FlutterSecureStorage _storage;

  String _key(String userId) => 'video_engagement_$userId';

  Future<VideoEngagementData> load(String userId) async {
    final raw = await _storage.read(key: _key(userId));
    if (raw == null || raw.isEmpty) return const VideoEngagementData();

    final decoded = jsonDecode(raw);
    if (decoded is! Map) return const VideoEngagementData();

    final reactionsRaw = decoded['reactions'];
    final downloadsRaw = decoded['downloads'];

    final reactions = <String, String>{};
    if (reactionsRaw is Map) {
      reactionsRaw.forEach((key, value) {
        final reaction = value?.toString();
        if (reaction == 'like' || reaction == 'dislike') {
          reactions[key.toString()] = reaction!;
        }
      });
    }

    final downloads = <String, VideoDownloadRecord>{};
    if (downloadsRaw is Map) {
      downloadsRaw.forEach((key, value) {
        if (value is Map) {
          downloads[key.toString()] = VideoDownloadRecord.fromJson(
            Map<String, dynamic>.from(value),
          );
        }
      });
    }

    return VideoEngagementData(reactions: reactions, downloads: downloads);
  }

  Future<void> save(String userId, VideoEngagementData data) async {
    await _storage.write(
      key: _key(userId),
      value: jsonEncode({
        'reactions': data.reactions,
        'downloads': data.downloads.map(
          (id, record) => MapEntry(id, record.toJson()),
        ),
      }),
    );
  }
}
