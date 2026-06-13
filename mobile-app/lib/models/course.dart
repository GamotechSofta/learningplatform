import '../core/utils/media_url.dart';
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

  bool get isPaid => lifetime > 0 || yearly > 0 || monthly > 0;
}

class Course {
  const Course({
    required this.id,
    required this.title,
    required this.slug,
    required this.description,
    this.thumbnail,
    this.previewVideoUrl,
    this.categoryId,
    this.categoryName,
    this.level = 'beginner',
    this.isPublished = false,
    this.pricing = const CoursePricing(),
    this.instructorName,
    this.lessons = const [],
    this.videoCount = 0,
    this.isPaid = false,
    this.hasAccess = false,
    this.hasPurchased = false,
    this.previewVideoCount = 0,
    this.hasPlayableVideos,
  });

  final String id;
  final String title;
  final String slug;
  final String description;
  final String? thumbnail;
  final String? previewVideoUrl;
  final String? categoryId;
  final String? categoryName;
  final String level;

  bool get hasBanner => thumbnail != null && thumbnail!.isNotEmpty;
  final bool isPublished;
  final CoursePricing pricing;
  final String? instructorName;
  final List<Lesson> lessons;
  final int videoCount;
  final bool isPaid;
  final bool hasAccess;
  final bool hasPurchased;
  final int previewVideoCount;
  /// `true`/`false` from API; `null` when the server did not send the flag.
  final bool? hasPlayableVideos;

  factory Course.fromJson(
    Map<String, dynamic> json, {
    bool includeAllPlayable = false,
  }) {
    final instructor = json['instructor'];
    final category = json['category'];
    final lessonsRaw = json['lessons'];
    final lessons = <Lesson>[];
    if (lessonsRaw is List) {
      lessons.addAll(
        lessonsRaw
            .whereType<Map>()
            .map(
              (l) => Lesson.fromJson(
                Map<String, dynamic>.from(l),
                includeAllPlayable: includeAllPlayable,
              ),
            )
            .where((l) => includeAllPlayable ? l.videos.isNotEmpty : l.isPublished),
      );
      lessons.sort((a, b) => a.order.compareTo(b.order));
    }

    final videoCount = lessons.fold<int>(0, (sum, l) => sum + l.videoCount);
    final pricing = CoursePricing.fromJson(
      json['pricing'] is Map ? Map<String, dynamic>.from(json['pricing']) : null,
    );
    final isPaid = json['isPaid'] == true || pricing.isPaid;
    final hasPurchased = json['hasPurchased'] == true;
    final hasAccess = _resolveHasAccess(
      json: json,
      lessons: lessons,
      isPaid: isPaid,
      hasPurchased: hasPurchased,
    );

    return Course(
      id: json['_id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Untitled',
      slug: json['slug']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      thumbnail: _resolveThumbnail(json, lessons),
      previewVideoUrl: _resolvePreviewVideoUrl(json, lessons),
      categoryId: category is Map ? category['_id']?.toString() : null,
      categoryName: category is Map ? category['name']?.toString() : null,
      level: json['level']?.toString() ?? 'beginner',
      isPublished: json['isPublished'] == true,
      pricing: pricing,
      instructorName: instructor is Map ? instructor['name']?.toString() : null,
      lessons: lessons,
      videoCount: videoCount,
      isPaid: isPaid,
      hasAccess: hasAccess,
      hasPurchased: hasPurchased,
      previewVideoCount: (json['previewVideoCount'] as num?)?.toInt() ?? 0,
      hasPlayableVideos: json['hasPlayableVideos'] is bool
          ? json['hasPlayableVideos'] as bool
          : null,
    );
  }

  static String? _resolveThumbnail(
    Map<String, dynamic> json,
    List<Lesson> lessons,
  ) {
    final direct = MediaUrl.resolve(json['thumbnail']?.toString());
    if (direct != null && direct.isNotEmpty) return direct;

    for (final lesson in lessons) {
      for (final video in lesson.videos) {
        final thumb = video.thumbnail;
        if (thumb != null && thumb.isNotEmpty) return thumb;
      }
    }

    return null;
  }

  static String? _resolvePreviewVideoUrl(
    Map<String, dynamic> json,
    List<Lesson> lessons,
  ) {
    final fromApi = MediaUrl.resolve(json['previewVideoUrl']?.toString());
    if (fromApi != null && fromApi.isNotEmpty) return fromApi;

    for (final lesson in lessons) {
      for (final video in lesson.videos) {
        if (video.videoUrl.isNotEmpty) return video.videoUrl;
      }
    }

    final legacy = MediaUrl.resolve(json['previewVideo']?.toString());
    if (legacy != null && legacy.isNotEmpty) return legacy;

    return null;
  }

  static bool _resolveHasAccess({
    required Map<String, dynamic> json,
    required List<Lesson> lessons,
    required bool isPaid,
    required bool hasPurchased,
  }) {
    if (hasPurchased || json['hasPurchased'] == true) return true;
    if (json['hasAccess'] is bool) return json['hasAccess'] as bool;

    final hasLockedVideos = lessons.any(
      (lesson) => lesson.videos.any((video) => video.isLocked),
    );
    if (hasLockedVideos) return false;
    if (!isPaid) return true;

    return false;
  }

  Map<String, dynamic> toStorageJson() {
    return {
      '_id': id,
      'title': title,
      'slug': slug,
      'description': description,
      'thumbnail': thumbnail,
      'previewVideoUrl': previewVideoUrl,
      'category': categoryId != null
          ? {'_id': categoryId, 'name': categoryName}
          : null,
      'level': level,
      'isPublished': isPublished,
      'pricing': {
        'monthly': pricing.monthly,
        'yearly': pricing.yearly,
        'lifetime': pricing.lifetime,
        'currency': pricing.currency,
      },
      'videoCount': videoCount,
      'isPaid': isPaid,
    };
  }
}
