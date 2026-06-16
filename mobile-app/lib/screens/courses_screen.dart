import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
import '../core/utils/course_list_utils.dart';
import '../models/course.dart';
import '../providers/catalog_provider.dart';
import '../widgets/course_card.dart';
import '../widgets/courses/course_filter_bar.dart';
import '../widgets/dismiss_focus_on_tap.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_view.dart';
import '../widgets/skeleton/course_list_skeleton.dart';

class CoursesScreen extends StatefulWidget {
  const CoursesScreen({super.key});

  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();

  String _query = '';
  String? _level;
  CoursePriceFilter _priceFilter = CoursePriceFilter.all;
  CourseSortOption _sort = CourseSortOption.nameAsc;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CatalogProvider>().load(forceRefresh: true);
    });
    _searchController.addListener(() {
      setState(() => _query = _searchController.text);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _refresh() =>
      context.read<CatalogProvider>().load(forceRefresh: true);

  void _clearFilters() {
    setState(() {
      _level = null;
      _priceFilter = CoursePriceFilter.all;
      _sort = CourseSortOption.nameAsc;
      _searchController.clear();
      _query = '';
    });
  }

  bool get _hasActiveFilters =>
      _level != null ||
      _priceFilter != CoursePriceFilter.all ||
      _sort != CourseSortOption.nameAsc ||
      _query.trim().isNotEmpty;

  List<Course> _filteredCourses(List<Course> allCourses) =>
      CourseListUtils.filterAndSort(
        courses: allCourses,
        query: _query,
        level: _level,
        priceFilter: _priceFilter,
        sort: _sort,
        prioritizeThumbnails: false,
      );

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final catalog = context.watch<CatalogProvider>();
    final loading = catalog.loading && catalog.courses.isEmpty;
    final error = catalog.error;
    final allCourses = catalog.courses;
    final filtered = _filteredCourses(allCourses);

    return Scaffold(
      backgroundColor: c.background,
      body: SafeArea(
        child: DismissFocusOnTap(
          child: loading
              ? const CourseListSkeleton()
              : error != null && allCourses.isEmpty
                  ? ErrorView(message: error, onRetry: _refresh)
                  : RefreshIndicator(
                      onRefresh: _refresh,
                      child: CustomScrollView(
                        controller: _scrollController,
                        keyboardDismissBehavior:
                            ScrollViewKeyboardDismissBehavior.onDrag,
                        physics: const AlwaysScrollableScrollPhysics(),
                        slivers: [
                          SliverToBoxAdapter(
                            child: _CoursesHeader(
                              totalCount: allCourses.length,
                              filteredCount: filtered.length,
                              hasActiveFilters: _hasActiveFilters,
                              onClearFilters: _clearFilters,
                            ),
                          ),
                          SliverToBoxAdapter(
                            child: Padding(
                              padding:
                                  const EdgeInsets.fromLTRB(20, 0, 20, 12),
                              child: TextField(
                                controller: _searchController,
                                decoration: InputDecoration(
                                  hintText: 'Search by title, topic, or category',
                                  prefixIcon:
                                      const Icon(Icons.search_rounded),
                                  suffixIcon: _query.isNotEmpty
                                      ? IconButton(
                                          icon: const Icon(Icons.clear_rounded),
                                          onPressed: _searchController.clear,
                                        )
                                      : null,
                                ),
                              ),
                            ),
                          ),
                          SliverPersistentHeader(
                            pinned: true,
                            delegate: CourseRefineStickyHeader(
                              selectedLevel: _level,
                              priceFilter: _priceFilter,
                              sort: _sort,
                              onLevelChanged: (level) =>
                                  setState(() => _level = level),
                              onPriceFilterChanged: (filter) =>
                                  setState(() => _priceFilter = filter),
                              onSortChanged: (sort) =>
                                  setState(() => _sort = sort),
                            ),
                          ),
                          if (error != null && allCourses.isNotEmpty)
                            SliverToBoxAdapter(
                              child: Padding(
                                padding: const EdgeInsets.fromLTRB(20, 4, 20, 8),
                                child: Material(
                                  color: AppColors.primary.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 10,
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(
                                          Icons.cloud_off_outlined,
                                          size: 18,
                                          color: AppColors.primary,
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            'Showing saved courses. Pull to refresh.',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: c.textSecondary,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          if (filtered.isEmpty)
                            SliverFillRemaining(
                              hasScrollBody: false,
                              child: EmptyState(
                                title: allCourses.isEmpty
                                    ? 'No courses available'
                                    : 'No matching courses',
                                subtitle: allCourses.isEmpty
                                    ? 'Check your connection and pull to refresh.'
                                    : 'Try a different search or clear your filters.',
                                icon: Icons.school_outlined,
                                actionLabel:
                                    _hasActiveFilters ? 'Clear filters' : null,
                                onAction:
                                    _hasActiveFilters ? _clearFilters : null,
                              ),
                            )
                          else
                            SliverPadding(
                              padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                              sliver: SliverList.separated(
                                itemCount: filtered.length,
                                separatorBuilder: (_, __) =>
                                    const SizedBox(height: 8),
                                itemBuilder: (context, index) {
                                  final course = filtered[index];
                                  return CourseCard(
                                    course: course,
                                    onTap: () {
                                      context
                                          .read<CatalogProvider>()
                                          .prefetchCourseDetail(course.id);
                                      context.push('/courses/${course.id}');
                                    },
                                  );
                                },
                              ),
                            ),
                        ],
                      ),
                    ),
        ),
      ),
    );
  }
}

class _CoursesHeader extends StatelessWidget {
  const _CoursesHeader({
    required this.totalCount,
    required this.filteredCount,
    required this.hasActiveFilters,
    required this.onClearFilters,
  });

  final int totalCount;
  final int filteredCount;
  final bool hasActiveFilters;
  final VoidCallback onClearFilters;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Explore Courses',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w800,
              color: c.textPrimary,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            totalCount == 0
                ? 'Browse our full course library'
                : hasActiveFilters
                    ? 'Showing $filteredCount of $totalCount courses'
                    : '$totalCount course${totalCount == 1 ? '' : 's'} available',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: c.textSecondary,
              height: 1.4,
            ),
          ),
          if (hasActiveFilters) ...[
            const SizedBox(height: 10),
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: onClearFilters,
                icon: const Icon(Icons.filter_alt_off_outlined, size: 18),
                label: const Text('Clear all filters'),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  padding: EdgeInsets.zero,
                  textStyle: const TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
