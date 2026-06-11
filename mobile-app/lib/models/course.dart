import 'lesson.dart';

class CoursePricing {
  const CoursePricing({
    this.monthly = 0,
    this.yearly = 0,
    this.lifetime = 0,
    this.currency = 'INR',
  });

  final double monthly;
  final double yearly;
  final double lifetime;
  final String currency;

  factory CoursePricing.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const CoursePricing();
    return CoursePricing(
      monthly: (json['monthly'] as num?)?.toDouble() ?? 0,
      yearly: (json['yearly'] as num?)?.toDouble() ?? 0,
      lifetime: (json['lifetime'] as num?)?.toDouble() ?? 0,
      currency: json['currency']?.toString() ?? 'INR',
    );
  }

  String get displayPrice {
    if (lifetime > 0) return '$currency ${lifetime.toStringAsFixed(0)}';
    if (yearly > 0) return '$currency ${yearly.toStringAsFixed(0)}/yr';
    if (monthly > 0) return '$currency ${monthly.toStringAsFixed(0)}/mo';
    return 'Free';
  }
}

class Course {
  const Course({
    required this.id,
    required this.title,
    required this.slug,
    required this.description,
    this.thumbnail,
    this.level = 'beginner',
    this.isPublished = false,
    this.pricing = const CoursePricing(),
    this.instructorName,
    this.lessons = const [],
    this.videoCount = 0,
  });

  final String id;
  final String title;
  final String slug;
  final String description;
  final String? thumbnail;
  final String level;
  final bool isPublished;
  final CoursePricing pricing;
  final String? instructorName;
  final List<Lesson> lessons;
  final int videoCount;

  factory Course.fromJson(Map<String, dynamic> json) {
    final instructor = json['instructor'];
    final lessonsRaw = json['lessons'];
    final lessons = <Lesson>[];
    if (lessonsRaw is List) {
      lessons.addAll(
        lessonsRaw
            .whereType<Map>()
            .map((l) => Lesson.fromJson(Map<String, dynamic>.from(l)))
            .where((l) => l.isPublished),
      );
      lessons.sort((a, b) => a.order.compareTo(b.order));
    }

    final videoCount = lessons.fold<int>(0, (sum, l) => sum + l.videoCount);

    return Course(
      id: json['_id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Untitled',
      slug: json['slug']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      thumbnail: json['thumbnail']?.toString(),
      level: json['level']?.toString() ?? 'beginner',
      isPublished: json['isPublished'] == true,
      pricing: CoursePricing.fromJson(
        json['pricing'] is Map ? Map<String, dynamic>.from(json['pricing']) : null,
      ),
      instructorName: instructor is Map ? instructor['name']?.toString() : null,
      lessons: lessons,
      videoCount: videoCount,
    );
  }
}
