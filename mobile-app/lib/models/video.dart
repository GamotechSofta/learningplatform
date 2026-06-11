class VideoItem {
  const VideoItem({
    required this.id,
    required this.title,
    required this.videoUrl,
    this.description,
    this.thumbnail,
    this.duration = 0,
    this.order = 0,
    this.isPublished = false,
    this.isFree = false,
  });

  final String id;
  final String title;
  final String? description;
  final String videoUrl;
  final String? thumbnail;
  final int duration;
  final int order;
  final bool isPublished;
  final bool isFree;

  factory VideoItem.fromJson(Map<String, dynamic> json, {bool lessonIsFree = false}) {
    return VideoItem(
      id: json['_id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Untitled',
      description: json['description']?.toString(),
      videoUrl: json['videoUrl']?.toString() ?? json['externalUrl']?.toString() ?? '',
      thumbnail: json['thumbnail']?.toString(),
      duration: (json['duration'] as num?)?.toInt() ?? 0,
      order: (json['order'] as num?)?.toInt() ?? 0,
      isPublished: json['isPublished'] == true,
      isFree: lessonIsFree,
    );
  }
}
