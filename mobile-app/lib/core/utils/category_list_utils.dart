import '../../models/category.dart';

class CategoryListUtils {
  CategoryListUtils._();

  /// Home screen "Top Categories" display order.
  static final _homeOrderMatchers = <bool Function(String slug, String name)>[
    (slug, name) => slug.contains('aws') || name.contains('devops'),
    (slug, name) => slug.contains('jee') || name.contains('jee'),
    (slug, name) => slug.contains('vocational') || name.contains('vocational'),
    (slug, name) =>
        slug.contains('it-course') || name.contains('it course'),
    (slug, name) =>
        slug.contains('video-editing') || name.contains('video editing'),
    (slug, name) => slug.contains('cyber') || name.contains('security'),
    (slug, name) => slug.contains('skill') || name.contains('skill cour'),
    (slug, name) =>
        slug.contains('operating-system') ||
        name.contains('operating system') ||
        name.contains('(os)'),
  ];

  static int homeDisplayRank(Category category) {
    final slug = category.slug.toLowerCase();
    final name = category.name.toLowerCase();

    for (var i = 0; i < _homeOrderMatchers.length; i++) {
      if (_homeOrderMatchers[i](slug, name)) return i;
    }
    return _homeOrderMatchers.length;
  }

  /// Sorts categories for the home top row; known categories follow the fixed
  /// sequence, everything else appears after alphabetically.
  static List<Category> sortForHome(List<Category> categories) {
    final copy = List<Category>.from(categories);
    copy.sort((a, b) {
      final rankA = homeDisplayRank(a);
      final rankB = homeDisplayRank(b);
      if (rankA != rankB) return rankA.compareTo(rankB);
      return a.name.toLowerCase().compareTo(b.name.toLowerCase());
    });
    return copy;
  }
}
