import 'dart:io';

import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';

class DiscoveredDownloadFile {
  const DiscoveredDownloadFile({
    required this.courseId,
    required this.videoId,
    required this.localPath,
    required this.modifiedAt,
  });

  final String courseId;
  final String videoId;
  final String localPath;
  final DateTime modifiedAt;
}

class VideoDownloadService {
  VideoDownloadService({Dio? dio}) : _dio = dio ?? Dio();

  final Dio _dio;

  Future<String> _videosRoot() async {
    final dir = await getApplicationDocumentsDirectory();
    final folder = Directory('${dir.path}/offline_videos');
    if (!await folder.exists()) {
      await folder.create(recursive: true);
    }
    return folder.path;
  }

  String localFilePath(String courseId, String videoId) {
    final safeCourse = courseId.replaceAll(RegExp(r'[^\w-]'), '_');
    final safeVideo = videoId.replaceAll(RegExp(r'[^\w-]'), '_');
    return '$safeCourse/$safeVideo.mp4';
  }

  Future<String> resolveFullPath(String courseId, String videoId) async {
    final root = await _videosRoot();
    return '$root/${localFilePath(courseId, videoId)}';
  }

  Future<bool> exists(String courseId, String videoId) async {
    final file = File(await resolveFullPath(courseId, videoId));
    return file.exists();
  }

  Future<String> download({
    required String url,
    required String courseId,
    required String videoId,
    void Function(double progress)? onProgress,
  }) async {
    final root = await _videosRoot();
    final relative = localFilePath(courseId, videoId);
    final file = File('$root/$relative');
    await file.parent.create(recursive: true);

    if (await file.exists() && await file.length() > 0) {
      return file.path;
    }

    await _dio.download(
      url,
      file.path,
      onReceiveProgress: (received, total) {
        if (total <= 0) return;
        onProgress?.call((received / total).clamp(0.0, 1.0));
      },
      options: Options(
        followRedirects: true,
        receiveTimeout: const Duration(minutes: 30),
      ),
    );

    return file.path;
  }

  Future<List<DiscoveredDownloadFile>> scanDownloadedFiles() async {
    final root = await _videosRoot();
    final rootDir = Directory(root);
    if (!await rootDir.exists()) return [];

    final items = <DiscoveredDownloadFile>[];
    await for (final entry in rootDir.list()) {
      if (entry is! Directory) continue;

      final courseId = entry.path.split(Platform.pathSeparator).last;
      await for (final fileEntry in entry.list()) {
        if (fileEntry is! File) continue;
        if (!fileEntry.path.toLowerCase().endsWith('.mp4')) continue;
        if (await fileEntry.length() <= 0) continue;

        final fileName = fileEntry.path.split(Platform.pathSeparator).last;
        final videoId = fileName.length > 4
            ? fileName.substring(0, fileName.length - 4)
            : fileName;
        items.add(
          DiscoveredDownloadFile(
            courseId: courseId,
            videoId: videoId,
            localPath: fileEntry.path,
            modifiedAt: await fileEntry.lastModified(),
          ),
        );
      }
    }

    items.sort((a, b) => b.modifiedAt.compareTo(a.modifiedAt));
    return items;
  }

  Future<void> deleteFile(String localPath) async {
    final file = File(localPath);
    if (await file.exists()) {
      await file.delete();
    }
  }
}
