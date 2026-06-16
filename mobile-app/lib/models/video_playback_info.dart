class VideoPlaybackInfo {
  const VideoPlaybackInfo({
    required this.id,
    required this.title,
    required this.lessonId,
    required this.lessonTitle,
    required this.videoUrl,
    required this.hlsUrl,
    this.thumbnail,
    this.duration = 0,
    this.isLocked = false,
    this.streamingStatus = 'pending',
  });

  final String id;
  final String title;
  final String lessonId;
  final String lessonTitle;
  final String videoUrl;
  final String hlsUrl;
  final String? thumbnail;
  final int duration;
  final bool isLocked;
  final String streamingStatus;

  factory VideoPlaybackInfo.fromJson(Map<String, dynamic> json) {
    return VideoPlaybackInfo(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Video',
      lessonId: json['lessonId']?.toString() ?? '',
      lessonTitle: json['lessonTitle']?.toString() ?? '',
      videoUrl: json['videoUrl']?.toString() ?? '',
      hlsUrl: json['hlsUrl']?.toString() ?? '',
      thumbnail: json['thumbnail']?.toString(),
      duration: (json['duration'] as num?)?.toInt() ?? 0,
      isLocked: json['isLocked'] == true,
      streamingStatus: json['streamingStatus']?.toString() ?? 'pending',
    );
  }
}
