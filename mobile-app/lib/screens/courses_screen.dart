import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/theme/app_colors.dart';
import '../core/utils/course_list_utils.dart';
import '../models/category.dart';
import '../models/course.dart';
import '../services/category_service.dart';
import '../services/course_service.dart';
import '../widgets/course_card.dart';
import '../widgets/dismiss_focus_on_tap.dart';
import '../widgets/courses/course_filter_bar.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_view.dart';
import '../widgets/home/section_header.dart';

class CoursesScreen extends StatefulWidget {
  const CoursesScreen({
    super.key,
    required this.courseService,
    required this.categoryService,
  });

  final CourseService courseService;
  final CategoryService categoryService;

  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> {
  final _searchController = TextEditingController();

  List<Course> _allCourses = [];
  List<Category> _categories = [];
  bool _loading = true;
  String? _error;

  String _query = '';
  String? _categoryId;
  String? _level;
  CoursePriceFilter _priceFilter = CoursePriceFilter.all;
  CourseSortOption _sort = CourseSortOption.featured;

  @override
  void initState() {
    super.initState();
    _load();
    _searchController.addListener(() {
      setState(() => _query = _searchController.text);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final results = await Future.wait([
        widget.courseService.getPublishedCourses(),
        widget.categoryService.getPublishedCategories(),
      ]);

      if (!mounted) return;

      setState(() {
        _allCourses = results[0] as List<Course>;
        _categories = results[1] as List<Category>;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _clearFilters() {
    setState(() {
      _categoryId = null;
      _level = null;
      _priceFilter = CoursePriceFilter.all;
      _sort = CourseSortOption.featured;
      _searchController.clear();
      _query = '';
    });
  }

  bool get _hasActiveFilters =>
      _categoryId != null ||
      _level != null ||
      _priceFilter != CoursePriceFilter.all ||
      _sort != CourseSortOption.featured ||
      _query.trim().isNotEmpty;

  List<Course> get _filteredCourses => CourseListUtils.filterAndSort(
        courses: _allCourses,
        query: _query,
        categoryId: _categoryId,
        level: _level,
        priceFilter: _priceFilter,
        sort: _sort,
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: DismissFocusOnTap(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? ErrorView(message: _error!, onRetry: _load)
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: _buildContent(),
                    ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    final filtered = _filteredCourses;

    return CustomScrollView(
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      physics: const AlwaysScrollableScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 12),
              const SectionHeader(title: 'All Courses'),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search courses...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    suffixIcon: _query.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded),
                            onPressed: () => _searchController.clear(),
                          )
                        : null,
                    filled: true,
                    fillColor: AppColors.inputFill,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              CourseFilterBar(
                categories: _categories,
                selectedCategoryId: _categoryId,
                selectedLevel: _level,
                priceFilter: _priceFilter,
                sort: _sort,
                onCategoryChanged: (id) => setState(() => _categoryId = id),
                onLevelChanged: (level) => setState(() => _level = level),
                onPriceFilterChanged: (filter) => setState(() => _priceFilter = filter),
                onSortChanged: (sort) => setState(() => _sort = sort),
                onClearFilters: _clearFilters,
                hasActiveFilters: _hasActiveFilters,
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
                child: Text(
                  '${filtered.length} course${filtered.length == 1 ? '' : 's'}',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
        ),
        if (filtered.isEmpty)
          const SliverFillRemaining(
            hasScrollBody: false,
            child: EmptyState(
              title: 'No courses found',
              subtitle: 'Try a different search or clear your filters.',
              icon: Icons.school_outlined,
            ),
          )
        else
          _courseSliver(filtered),
        const SliverToBoxAdapter(child: SizedBox(height: 24)),
      ],
    );
  }

  SliverList _courseSliver(List<Course> courses) {
    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) {
          final course = courses[index];
          return Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 14),
            child: CourseCard(
              course: course,
              onTap: () => context.push('/courses/${course.id}'),
            ),
          );
        },
        childCount: courses.length,
      ),
    );
  }
}
