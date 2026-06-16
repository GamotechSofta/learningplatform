import '../core/utils/media_url.dart';

class VideoItem {
  const VideoItem({
    required this.id,
    required this.title,
    required this.videoUrl,
    this.hlsUrl,
    this.description,
    this.thumbnail,
    this.duration = 0,
    this.order = 0,
    this.isPublished = false,
    this.isFree = false,
    this.isLocked = false,
    this.previewVideoUrl,
  });

  final String id;
  final String title;
  final String? description;
  final String videoUrl;
  final String? hlsUrl;
  final String? thumbnail;
  final String? previewVideoUrl;
  final int duration;
  final int order;
  final bool isPublished;
  final bool isFree;
  final bool isLocked;

  /// True when the video has an unlocked progressive or HLS source.
  bool get hasPlayableSource {
    if (isLocked) return false;
    if (videoUrl.isNotEmpty) return true;
    final hls = hlsUrl;
    return hls != null && hls.isNotEmpty;
  }

  /// URL used to extract a poster frame (playback URL or locked preview).
  String? get frameSourceUrl {
    if (videoUrl.isNotEmpty) return videoUrl;
    if (previewVideoUrl != null && previewVideoUrl!.isNotEmpty) {
      return previewVideoUrl;
    }
    return null;
  }

  VideoItem copyWith({
    String? id,
    String? title,
    String? description,
    String? videoUrl,
    String? hlsUrl,
    String? thumbnail,
    String? previewVideoUrl,
    int? duration,
    int? order,
    bool? isPublished,
    bool? isFree,
    bool? isLocked,
  }) {
    return VideoItem(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      videoUrl: videoUrl ?? this.videoUrl,
      hlsUrl: hlsUrl ?? this.hlsUrl,
      thumbnail: thumbnail ?? this.thumbnail,
      previewVideoUrl: previewVideoUrl ?? this.previewVideoUrl,
      duration: duration ?? this.duration,
      order: order ?? this.order,
      isPublished: isPublished ?? this.isPublished,
      isFree: isFree ?? this.isFree,
      isLocked: isLocked ?? this.isLocked,
    );
  }

  factory VideoItem.fromJson(Map<String, dynamic> json, {bool lessonIsFree = false}) {
    final isLocked = json['isLocked'] == true;

    return VideoItem(
      id: json['_id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Untitled',
      description: json['description']?.toString(),
      videoUrl: isLocked ? '' : _resolvePlaybackUrl(json),
      hlsUrl: isLocked ? null : _resolveHlsUrl(json),
      previewVideoUrl: MediaUrl.resolve(json['previewVideoUrl']?.toString()),
      thumbnail: MediaUrl.resolve(
        json['thumbnail']?.toString() ?? json['thumbnailKey']?.toString(),
      ),
      duration: (json['duration'] as num?)?.toInt() ?? 0,
      order: (json['order'] as num?)?.toInt() ?? 0,
      isPublished: json['isPublished'] == true,
      isFree: lessonIsFree,
      isLocked: isLocked,
    );
  }

  static String _resolvePlaybackUrl(Map<String, dynamic> json) {
    if (json['videoUrl']?.toString().isNotEmpty == true) {
      return MediaUrl.resolve(json['videoUrl']?.toString()) ?? '';
    }
    return MediaUrl.videoUrlFromKey(
      json['videoKey']?.toString(),
      externalUrl: json['externalUrl']?.toString(),
    );
  }

  static String? _resolveHlsUrl(Map<String, dynamic> json) {
    if (json['hlsUrl']?.toString().isNotEmpty == true) {
      return MediaUrl.resolve(json['hlsUrl']?.toString());
    }
    final fromKey = MediaUrl.resolve(json['hlsKey']?.toString());
    return fromKey?.isNotEmpty == true ? fromKey : null;
  }
}
