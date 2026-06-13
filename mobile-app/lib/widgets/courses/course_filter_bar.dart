import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/course_list_utils.dart';
import '../../models/category.dart';

class CourseFilterBar extends StatelessWidget {
  const CourseFilterBar({
    super.key,
    required this.categories,
    required this.selectedCategoryId,
    required this.selectedLevel,
    required this.priceFilter,
    required this.sort,
    required this.onCategoryChanged,
    required this.onLevelChanged,
    required this.onPriceFilterChanged,
    required this.onSortChanged,
    required this.onClearFilters,
    required this.hasActiveFilters,
  });

  final List<Category> categories;
  final String? selectedCategoryId;
  final String? selectedLevel;
  final CoursePriceFilter priceFilter;
  final CourseSortOption sort;
  final ValueChanged<String?> onCategoryChanged;
  final ValueChanged<String?> onLevelChanged;
  final ValueChanged<CoursePriceFilter> onPriceFilterChanged;
  final ValueChanged<CourseSortOption> onSortChanged;
  final VoidCallback onClearFilters;
  final bool hasActiveFilters;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: [
              _FilterChip(
                label: 'All',
                selected: priceFilter == CoursePriceFilter.all && selectedLevel == null,
                onTap: () {
                  onPriceFilterChanged(CoursePriceFilter.all);
                  onLevelChanged(null);
                },
              ),
              _FilterChip(
                label: 'Free',
                selected: priceFilter == CoursePriceFilter.free,
                onTap: () => onPriceFilterChanged(CoursePriceFilter.free),
              ),
              _FilterChip(
                label: 'Premium',
                selected: priceFilter == CoursePriceFilter.premium,
                onTap: () => onPriceFilterChanged(CoursePriceFilter.premium),
              ),
              _FilterChip(
                label: 'Beginner',
                selected: selectedLevel == 'beginner',
                onTap: () => onLevelChanged(
                  selectedLevel == 'beginner' ? null : 'beginner',
                ),
              ),
              _FilterChip(
                label: 'Intermediate',
                selected: selectedLevel == 'intermediate',
                onTap: () => onLevelChanged(
                  selectedLevel == 'intermediate' ? null : 'intermediate',
                ),
              ),
              _FilterChip(
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
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: [
              _FilterChip(
                label: 'All categories',
                selected: selectedCategoryId == null,
                onTap: () => onCategoryChanged(null),
              ),
              ...categories.map(
                (category) => _FilterChip(
                  label: category.name,
                  selected: selectedCategoryId == category.id,
                  onTap: () => onCategoryChanged(
                    selectedCategoryId == category.id ? null : category.id,
                  ),
                ),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 12, 0),
          child: Row(
            children: [
              PopupMenuButton<CourseSortOption>(
                initialValue: sort,
                onSelected: onSortChanged,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.sort_rounded, size: 18, color: AppColors.primary),
                      const SizedBox(width: 6),
                      Text(
                        _sortLabel(sort),
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const Icon(Icons.expand_more, size: 18, color: AppColors.textSecondary),
                    ],
                  ),
                ),
                itemBuilder: (context) => const [
                  PopupMenuItem(
                    value: CourseSortOption.featured,
                    child: Text('Featured (with image first)'),
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
              const Spacer(),
              if (hasActiveFilters)
                TextButton.icon(
                  onPressed: onClearFilters,
                  icon: const Icon(Icons.filter_alt_off_outlined, size: 18),
                  label: const Text('Clear'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    textStyle: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  static String _sortLabel(CourseSortOption sort) {
    return switch (sort) {
      CourseSortOption.featured => 'Featured',
      CourseSortOption.nameAsc => 'Name A–Z',
      CourseSortOption.nameDesc => 'Name Z–A',
      CourseSortOption.priceLow => 'Price ↑',
      CourseSortOption.priceHigh => 'Price ↓',
    };
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: selected ? Colors.white : AppColors.textPrimary,
          ),
        ),
        selected: selected,
        onSelected: (_) => onTap(),
        showCheckmark: false,
        selectedColor: AppColors.primary,
        backgroundColor: AppColors.surface,
        side: BorderSide(
          color: selected ? AppColors.primary : AppColors.border,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 4),
        visualDensity: VisualDensity.compact,
      ),
    );
  }
}
