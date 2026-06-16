import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/themed_colors.dart';
import '../../core/utils/course_list_utils.dart';

/// Pinned sort + refine strip while scrolling course list.
class CourseRefineStickyHeader extends SliverPersistentHeaderDelegate {
  CourseRefineStickyHeader({
    required this.selectedLevel,
    required this.priceFilter,
    required this.sort,
    required this.onLevelChanged,
    required this.onPriceFilterChanged,
    required this.onSortChanged,
  });

  static const height = 84.0;

  final String? selectedLevel;
  final CoursePriceFilter priceFilter;
  final CourseSortOption sort;
  final ValueChanged<String?> onLevelChanged;
  final ValueChanged<CoursePriceFilter> onPriceFilterChanged;
  final ValueChanged<CourseSortOption> onSortChanged;

  @override
  double get minExtent => height;

  @override
  double get maxExtent => height;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    final c = context.colors;

    return Material(
      color: c.background,
      elevation: overlapsContent ? 1.5 : 0,
      shadowColor: c.cardShadow,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: overlapsContent ? c.border : Colors.transparent,
            ),
          ),
        ),
        child: CourseRefineStrip(
          selectedLevel: selectedLevel,
          priceFilter: priceFilter,
          sort: sort,
          onLevelChanged: onLevelChanged,
          onPriceFilterChanged: onPriceFilterChanged,
          onSortChanged: onSortChanged,
        ),
      ),
    );
  }

  @override
  bool shouldRebuild(covariant CourseRefineStickyHeader old) {
    return old.selectedLevel != selectedLevel ||
        old.priceFilter != priceFilter ||
        old.sort != sort;
  }
}

class CourseRefineStrip extends StatelessWidget {
  const CourseRefineStrip({
    super.key,
    required this.selectedLevel,
    required this.priceFilter,
    required this.sort,
    required this.onLevelChanged,
    required this.onPriceFilterChanged,
    required this.onSortChanged,
  });

  final String? selectedLevel;
  final CoursePriceFilter priceFilter;
  final CourseSortOption sort;
  final ValueChanged<String?> onLevelChanged;
  final ValueChanged<CoursePriceFilter> onPriceFilterChanged;
  final ValueChanged<CourseSortOption> onSortChanged;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
          child: PopupMenuButton<CourseSortOption>(
            initialValue: sort,
            onSelected: onSortChanged,
            offset: const Offset(0, 28),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: c.border),
            ),
            child: Text(
              'Sort: ${_sortLabel(sort)}',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: c.textPrimary,
              ),
            ),
            itemBuilder: (context) => const [
              PopupMenuItem(
                value: CourseSortOption.featured,
                child: Text('Featured'),
              ),
              PopupMenuItem(
                value: CourseSortOption.nameAsc,
                child: Text('Name A–Z'),
              ),
              PopupMenuItem(
                value: CourseSortOption.nameDesc,
                child: Text('Name Z–A'),
              ),
              PopupMenuItem(
                value: CourseSortOption.priceLow,
                child: Text('Price: Low to high'),
              ),
              PopupMenuItem(
                value: CourseSortOption.priceHigh,
                child: Text('Price: High to low'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 28,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            children: [
              _RefineTextTab(
                label: 'All courses',
                selected: priceFilter == CoursePriceFilter.all &&
                    selectedLevel == null,
                onTap: () {
                  onPriceFilterChanged(CoursePriceFilter.all);
                  onLevelChanged(null);
                },
              ),
              _RefineTextTab(
                label: 'Free',
                selected: priceFilter == CoursePriceFilter.free,
                onTap: () => onPriceFilterChanged(CoursePriceFilter.free),
              ),
              _RefineTextTab(
                label: 'Premium',
                selected: priceFilter == CoursePriceFilter.premium,
                onTap: () => onPriceFilterChanged(CoursePriceFilter.premium),
              ),
              _RefineTextTab(
                label: 'Beginner',
                selected: selectedLevel == 'beginner',
                onTap: () => onLevelChanged(
                  selectedLevel == 'beginner' ? null : 'beginner',
                ),
              ),
              _RefineTextTab(
                label: 'Intermediate',
                selected: selectedLevel == 'intermediate',
                onTap: () => onLevelChanged(
                  selectedLevel == 'intermediate' ? null : 'intermediate',
                ),
              ),
              _RefineTextTab(
                label: 'Advanced',
                selected: selectedLevel == 'advanced',
                onTap: () => onLevelChanged(
                  selectedLevel == 'advanced' ? null : 'advanced',
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
      ],
    );
  }

  static String _sortLabel(CourseSortOption sort) {
    return switch (sort) {
      CourseSortOption.featured => 'Featured',
      CourseSortOption.nameAsc => 'A–Z',
      CourseSortOption.nameDesc => 'Z–A',
      CourseSortOption.priceLow => 'Price ↑',
      CourseSortOption.priceHigh => 'Price ↓',
    };
  }
}

class _RefineTextTab extends StatelessWidget {
  const _RefineTextTab({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;

    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.only(right: 18),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: selected ? c.textPrimary : c.textSecondary,
            decoration: selected ? TextDecoration.underline : TextDecoration.none,
            decorationColor: AppColors.primary,
            decorationThickness: 2,
          ),
        ),
      ),
    );
  }
}
