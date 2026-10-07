import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/themed_colors.dart';
import '../../core/utils/category_list_utils.dart';
import '../../core/utils/course_filter_request.dart';
import '../../core/utils/course_list_utils.dart';
import '../../providers/catalog_provider.dart';

Future<CourseFilters?> showHomeFilterSheet(BuildContext context) {
  return showModalBottomSheet<CourseFilters>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: context.colors.surface,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (_) => const _HomeFilterSheet(),
  );
}

class _HomeFilterSheet extends StatefulWidget {
  const _HomeFilterSheet();

  @override
  State<_HomeFilterSheet> createState() => _HomeFilterSheetState();
}

class _HomeFilterSheetState extends State<_HomeFilterSheet> {
  String? _categoryId;
  String? _level;
  CoursePriceFilter _price = CoursePriceFilter.all;
  CourseSortOption _sort = CourseSortOption.nameAsc;

  static const _levels = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced',
  };

  static const _prices = {
    CoursePriceFilter.all: 'All',
    CoursePriceFilter.free: 'Free',
    CoursePriceFilter.premium: 'Premium',
  };

  static const _sorts = {
    CourseSortOption.nameAsc: 'Name A–Z',
    CourseSortOption.nameDesc: 'Name Z–A',
    CourseSortOption.priceLow: 'Price: Low to high',
    CourseSortOption.priceHigh: 'Price: High to low',
  };

  void _reset() {
    setState(() {
      _categoryId = null;
      _level = null;
      _price = CoursePriceFilter.all;
      _sort = CourseSortOption.nameAsc;
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final catalog = context.watch<CatalogProvider>();
    final categories = CategoryListUtils.sortForHome(
      CategoryListUtils.withCourses(catalog.categories, catalog.courses),
    );
    final matchCount = CourseListUtils.filterAndSort(
      courses: catalog.courses,
      categoryId: _categoryId,
      level: _level,
      priceFilter: _price,
      sort: _sort,
    ).length;

    return ConstrainedBox(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 10),
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: c.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 8, 4),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    'Filter Courses',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: c.textPrimary,
                    ),
                  ),
                ),
                TextButton(onPressed: _reset, child: const Text('Reset')),
              ],
            ),
          ),
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (categories.isNotEmpty) ...[
                    _SectionLabel('Category'),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _FilterChip(
                          label: 'All',
                          selected: _categoryId == null,
                          onTap: () => setState(() => _categoryId = null),
                        ),
                        for (final category in categories)
                          _FilterChip(
                            label: category.name,
                            selected: _categoryId == category.id,
                            onTap: () => setState(
                              () => _categoryId =
                                  _categoryId == category.id ? null : category.id,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 20),
                  ],
                  _SectionLabel('Level'),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _FilterChip(
                        label: 'All levels',
                        selected: _level == null,
                        onTap: () => setState(() => _level = null),
                      ),
                      for (final entry in _levels.entries)
                        _FilterChip(
                          label: entry.value,
                          selected: _level == entry.key,
                          onTap: () => setState(
                            () => _level = _level == entry.key ? null : entry.key,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _SectionLabel('Price'),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final entry in _prices.entries)
                        _FilterChip(
                          label: entry.value,
                          selected: _price == entry.key,
                          onTap: () => setState(() => _price = entry.key),
                        ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _SectionLabel('Sort by'),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final entry in _sorts.entries)
                        _FilterChip(
                          label: entry.value,
                          selected: _sort == entry.key,
                          onTap: () => setState(() => _sort = entry.key),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: c.border)),
            ),
            child: SizedBox(
              height: 50,
              child: FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: matchCount == 0
                    ? null
                    : () => Navigator.of(context).pop(
                          CourseFilters(
                            categoryId: _categoryId,
                            level: _level,
                            priceFilter: _price,
                            sort: _sort,
                          ),
                        ),
                child: Text(
                  matchCount == 0
                      ? 'No matching courses'
                      : 'Show $matchCount course${matchCount == 1 ? '' : 's'}',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: context.colors.textPrimary,
        ),
      ),
    );
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
    final c = context.colors;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : c.inputFill,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: selected ? AppColors.primary : c.border),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: selected ? Colors.white : c.textPrimary,
          ),
        ),
      ),
    );
  }
}
