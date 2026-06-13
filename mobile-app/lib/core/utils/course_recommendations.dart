import '../../models/category.dart';
import '../../models/course.dart';
import '../constants/learning_tracks.dart';
import 'category_list_utils.dart';
import 'course_list_utils.dart';

class CourseRecommendations {
  CourseRecommendations._();

  static String _text(Course course) {
    return '${course.title} ${course.description} ${course.categoryName ?? ''} ${course.slug}'
        .toLowerCase();
  }

  static String _cat(Course course) => course.categoryName?.toLowerCase() ?? '';

  static int scoreCourse(Course course, String track) {
    final text = _text(course);
    final cat = _cat(course);

    switch (track) {
      case 'jee':
        if (cat.contains('jee')) return 100;
        if (text.contains('jee') || text.contains('physics')) return 90;
        if (text.contains('chemistry') || text.contains('mathematics')) return 80;
        if (text.contains('mains')) return 85;
        return 0;
      case 'class_8_10':
        if (cat.contains('vocational') || cat.contains('skill')) return 90;
        if (cat.contains('operating')) return 85;
        if (course.level == 'beginner') return 70;
        if (text.contains('beginner') || text.contains('basic')) return 65;
        if (cat.contains('jee')) return 0;
        return 40;
      case 'class_11_12':
        if (cat.contains('jee')) return 85;
        if (cat.contains('vocational')) return 75;
        if (course.level == 'intermediate' || course.level == 'advanced') {
          return 70;
        }
        if (text.contains('11') || text.contains('12')) return 80;
        return 50;
      case 'skills':
        if (cat.contains('it course')) return 95;
        if (cat.contains('aws') || text.contains('devops')) return 90;
        if (cat.contains('cyber') || cat.contains('security')) return 88;
        if (cat.contains('video editing')) return 85;
        if (cat.contains('skill')) return 80;
        if (cat.contains('operating')) return 75;
        if (text.contains('java') ||
            text.contains('linux') ||
            text.contains('network')) {
          return 78;
        }
        return 0;
      default:
        return 0;
    }
  }

  static int scoreCategory(Category category, String track) {
    final slug = category.slug.toLowerCase();
    final name = category.name.toLowerCase();

    bool has(String part) => slug.contains(part) || name.contains(part);

    switch (track) {
      case 'jee':
        return has('jee') ? 100 : 0;
      case 'class_8_10':
        if (has('vocational') || has('skill')) return 90;
        if (has('operating')) return 80;
        return has('jee') ? 0 : 40;
      case 'class_11_12':
        if (has('jee')) return 90;
        if (has('vocational')) return 70;
        return 50;
      case 'skills':
        if (has('it')) return 95;
        if (has('aws') || has('devops')) return 92;
        if (has('cyber') || has('security')) return 90;
        if (has('video')) return 88;
        if (has('skill')) return 85;
        if (has('operating')) return 75;
        return 0;
      default:
        return 0;
    }
  }

  static List<Course> forTrack({
    required List<Course> courses,
    required String? learningTrack,
    int limit = 6,
  }) {
    final playable =
        courses.where(CourseListUtils.hasPlayableVideos).toList();

    final track = learningTrack;
    if (track == null ||
        track.isEmpty ||
        track == LearningTracks.exploreAll) {
      return CourseListUtils.filterAndSort(
        courses: playable.where(CourseListUtils.hasBanner).toList(),
        sort: CourseSortOption.featured,
      ).take(limit).toList();
    }

    final ranked = playable
        .map((course) => MapEntry(course, scoreCourse(course, track)))
        .where((entry) => entry.value > 0)
        .toList()
      ..sort((a, b) {
        final score = b.value.compareTo(a.value);
        if (score != 0) return score;
        final banner = (CourseListUtils.hasBanner(b.key) ? 1 : 0)
            .compareTo(CourseListUtils.hasBanner(a.key) ? 1 : 0);
        if (banner != 0) return banner;
        return a.key.title.compareTo(b.key.title);
      });

    final picked = ranked.map((e) => e.key).toList();

    if (picked.length < limit) {
      final pickedIds = picked.map((c) => c.id).toSet();
      final filler = CourseListUtils.filterAndSort(
        courses: playable.where((c) => !pickedIds.contains(c.id)).toList(),
        sort: CourseSortOption.featured,
      );
      picked.addAll(filler.take(limit - picked.length));
    }

    return picked.take(limit).toList();
  }

  static List<Category> categoriesForTrack(
    List<Category> categories,
    String? learningTrack,
  ) {
    final track = learningTrack;
    if (track == null ||
        track.isEmpty ||
        track == LearningTracks.exploreAll) {
      return CategoryListUtils.sortForHome(categories);
    }

    final copy = List<Category>.from(categories);
    copy.sort((a, b) {
      final scoreA = scoreCategory(a, track);
      final scoreB = scoreCategory(b, track);
      if (scoreA != scoreB) return scoreB.compareTo(scoreA);
      return CategoryListUtils.homeDisplayRank(a)
          .compareTo(CategoryListUtils.homeDisplayRank(b));
    });
    return copy;
  }
}
