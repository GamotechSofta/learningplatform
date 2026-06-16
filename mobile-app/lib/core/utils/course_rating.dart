/// Deterministic pseudo-random ratings per course (stable across sessions).
class CourseRating {
  CourseRating._();

  static const double minRating = 4.0;
  static const double maxRating = 5.0;

  /// Returns a fixed rating between 4.0 and 5.0 (0.1 steps) for [courseId].
  static double forCourse(String courseId) {
    if (courseId.isEmpty) return 4.5;
    final h = _hash(courseId);
    final step = h % 11; // 0..10 → 4.0..5.0
    return minRating + step / 10;
  }

  /// Fixed review count for social proof (stable per course).
  static int reviewCountFor(String courseId) {
    if (courseId.isEmpty) return 120;
    final h = _hash('${courseId}_reviews');
    return 95 + (h % 2891); // 95 – 2985
  }

  static String formatCount(int count) {
    if (count >= 1000) {
      final k = count / 1000;
      return k >= 10 ? '${k.round()}k' : '${k.toStringAsFixed(1)}k';
    }
    return '$count';
  }

  static int _hash(String value) {
    var hash = 0;
    for (final unit in value.codeUnits) {
      hash = (hash * 31 + unit) & 0x7fffffff;
    }
    return hash;
  }
}
