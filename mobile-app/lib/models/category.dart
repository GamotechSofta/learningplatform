import '../core/utils/course_playability.dart';
import '../core/utils/media_url.dart';
import 'course.dart';

class Category {
  const Category({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.thumbnail,
    this.coursesCount = 0,
    this.courses = const [],
  });

  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? thumbnail;
  final int coursesCount;
  final List<Course> courses;

  factory Category.fromJson(Map<String, dynamic> json) {
    final coursesRaw = json['courses'];
    final courses = coursesRaw is List
        ? coursesRaw
            .whereType<Map>()
            .map(
              (c) => Course.fromJson(
                Map<String, dynamic>.from(c),
                includeAllPlayable: true,
              ),
            )
            .where((c) => c.isPublished)
            .toList()
        : <Course>[];

    final listable = CoursePlayability.filterListable(courses);

    return Category(
      id: json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Untitled',
      slug: json['slug']?.toString() ?? '',
      description: json['description']?.toString(),
      thumbnail: MediaUrl.resolve(json['thumbnail']?.toString()),
      coursesCount: listable.length,
      courses: listable,
    );
  }
}
