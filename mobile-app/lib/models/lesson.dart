import 'video.dart';

class Lesson {
  const Lesson({
    required this.id,
    required this.title,
    required this.order,
    this.description,
    this.isFree = false,
    this.isPublished = false,
    this.videos = const [],
  });

  final String id;
  final String title;
  final String? description;
  final int order;
  final bool isFree;
  final bool isPublished;
  final List<VideoItem> videos;

  factory Lesson.fromJson(
    Map<String, dynamic> json, {
    bool includeAllPlayable = false,
  }) {
    final isFree = json['isFree'] == true;
    final videosRaw = json['videos'];
    final videos = <VideoItem>[];
    if (videosRaw is List) {
      videos.addAll(
        videosRaw
            .whereType<Map>()
            .map(
              (v) => VideoItem.fromJson(
                Map<String, dynamic>.from(v),
                lessonIsFree: isFree,
              ),
            )
            .where((v) => includeAllPlayable || v.isPublished),
      );
      videos.sort((a, b) => a.order.compareTo(b.order));
    }

    return Lesson(
      id: json['_id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Untitled',
      description: json['description']?.toString(),
      order: (json['order'] as num?)?.toInt() ?? 0,
      isFree: isFree,
      isPublished: json['isPublished'] == true,
      videos: videos,
    );
  }

  int get videoCount => videos.length;
}
