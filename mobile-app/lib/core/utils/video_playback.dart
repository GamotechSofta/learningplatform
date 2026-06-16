import 'media_url.dart';

class VideoPlayback {
  VideoPlayback._();

  static String resolveUrl(String? raw) {
    if (raw == null) return '';
    final resolved = MediaUrl.resolve(raw);
    final url = (resolved ?? raw).trim();
    return url;
  }

  static bool isHlsManifest(String url) {
    final lower = url.toLowerCase();
    return lower.contains('.m3u8');
  }

  /// Progressive MP4 from CloudFront (HTTP range requests). HLS only when explicitly ready.
  static String resolvePlaybackSource({
    String? hlsUrl,
    String? mp4Url,
    String? streamingStatus,
  }) {
    final mp4 = resolveUrl(mp4Url);
    final hls = resolveUrl(hlsUrl);
    final hlsReady = streamingStatus == 'ready';

    if (hlsReady && hls.isNotEmpty && isHlsManifest(hls)) {
      return hls;
    }
    return mp4;
  }

  static bool isEmbeddableStream(String url) {
    final lower = url.toLowerCase();
    if (lower.isEmpty) return false;
    if (lower.contains('youtube.com') || lower.contains('youtu.be')) return false;
    if (lower.contains('vimeo.com')) return false;
    if (lower.contains('drive.google.com')) return false;
    return lower.startsWith('http://') || lower.startsWith('https://');
  }

  static String? streamQualityLabel(String url) {
    if (isHlsManifest(url)) return 'Auto quality';
    return null;
  }

  static String friendlyError(Object error) {
    final text = error.toString().toLowerCase();
    if (text.contains('unrecognizedinputformat') ||
        text.contains('source error') ||
        (text.contains('format') && text.contains('could not read'))) {
      return 'This video file is corrupted or unavailable on the server. '
          'Please contact support or try again after it has been re-uploaded.';
    }
    if (text.contains('timeout') || text.contains('taking too long')) {
      return 'Video is taking too long to load. Check your connection and try again.';
    }
    return error.toString().replaceFirst(RegExp(r'^Exception:\s*'), '');
  }
}
