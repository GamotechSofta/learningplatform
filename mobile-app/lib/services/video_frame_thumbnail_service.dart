import 'dart:io';

import 'package:path_provider/path_provider.dart';
import 'package:video_thumbnail/video_thumbnail.dart';

import '../core/utils/video_frame_utils.dart';

class VideoFrameThumbnailService {
  VideoFrameThumbnailService._();

  static final VideoFrameThumbnailService instance = VideoFrameThumbnailService._();

  final Map<String, Future<String?>> _inFlight = {};
  final Map<String, String> _memoryCache = {};
  final Set<String> _failedUrls = {};

  Future<String?> thumbnailPathFor(String videoUrl) {
    if (videoUrl.isEmpty) return Future.value(null);
    if (_failedUrls.contains(videoUrl)) return Future.value(null);

    final cached = _memoryCache[videoUrl];
    if (cached != null) return Future.value(cached);

    return _inFlight.putIfAbsent(videoUrl, () async {
      try {
        final dir = await getTemporaryDirectory();
        final fileName = 'vf_v2_${videoUrl.hashCode.abs()}.jpg';
        final target = File('${dir.path}/$fileName');
        if (await target.exists()) {
          if (await isUsableVideoFrameFile(target.path)) {
            _memoryCache[videoUrl] = target.path;
            return target.path;
          }
          await target.delete();
        }

        String? bestPath;

        for (final timeMs in kVideoThumbnailSampleTimesMs) {
          final generated = await VideoThumbnail.thumbnailFile(
            video: videoUrl,
            thumbnailPath: dir.path,
            imageFormat: ImageFormat.JPEG,
            maxWidth: 640,
            quality: 80,
            timeMs: timeMs,
          );

          if (generated == null) continue;

          final generatedFile = File(generated);
          if (!await generatedFile.exists()) continue;

          if (await isUsableVideoFrameFile(generated)) {
            await generatedFile.copy(target.path);
            if (generated != target.path) {
              await generatedFile.delete();
            }
            _memoryCache[videoUrl] = target.path;
            return target.path;
          }

          bestPath ??= generated;
        }

        if (bestPath != null) {
          final fallback = File(bestPath);
          if (await fallback.exists()) {
            await fallback.copy(target.path);
            if (bestPath != target.path) {
              await fallback.delete();
            }
            _memoryCache[videoUrl] = target.path;
            return target.path;
          }
        }

        _failedUrls.add(videoUrl);
        return null;
      } catch (_) {
        _failedUrls.add(videoUrl);
        return null;
      } finally {
        _inFlight.remove(videoUrl);
      }
    });
  }
}
