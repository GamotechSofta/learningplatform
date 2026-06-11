import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../config/app_config.dart';
import '../models/category.dart';
import '../models/course.dart';
import '../providers/auth_provider.dart';
import '../services/category_service.dart';
import '../services/course_service.dart';
import '../services/subscription_service.dart';
import '../widgets/app_drawer.dart';
import '../widgets/home/continue_learning_tile.dart';
import '../widgets/home/hero_banner.dart';
import '../widgets/home/home_header.dart';
import '../widgets/home/home_search_bar.dart';
import '../widgets/home/section_header.dart';
import '../widgets/home/top_category_tile.dart';
import '../widgets/home/trending_course_tile.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    required this.categoryService,
    required this.courseService,
    required this.subscriptionService,
    this.onExploreCourses,
  });

  final CategoryService categoryService;
  final CourseService courseService;
  final SubscriptionService subscriptionService;
  final VoidCallback? onExploreCourses;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Category> _categories = [];
  List<Course> _courses = [];
  Course? _continueCourse;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final auth = context.read<AuthProvider>();
      final userId = auth.isAuthenticated ? auth.user!.id : null;

      final results = await Future.wait([
        widget.categoryService.getPublishedCategories(),
        widget.courseService.getPublishedCourses(),
      ]);

      final categories = results[0] as List<Category>;
      final courses = results[1] as List<Course>;

      Course? continueCourse;
      if (userId != null) {
        try {
          final subs = await widget.subscriptionService.getUserSubscriptions(userId);
          final active = subs.where((s) => s.isActive).toList();
          if (active.isNotEmpty) continueCourse = active.first.course;
        } catch (_) {}
      }
      continueCourse ??= courses.isNotEmpty ? courses.first : null;

      if (!mounted) return;
      setState(() {
        _categories = categories;
        _courses = courses;
        _continueCourse = continueCourse;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = error.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: const AppDrawer(),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _load,
          child: ListView(
            padding: const EdgeInsets.only(bottom: 24),
            children: [
              const HomeHeader(),
              const HomeSearchBar(),
              HeroBanner(onExplore: widget.onExploreCourses),
              if (_error != null) ...[
                const SizedBox(height: 12),
                _ConnectionBanner(message: _error!, onRetry: _load),
              ],
              const SizedBox(height: 24),
              SectionHeader(
                title: 'Top Categories',
                onSeeAll: widget.onExploreCourses,
              ),
              const SizedBox(height: 14),
              _buildCategoriesSection(),
              const SizedBox(height: 24),
              if (_continueCourse != null) ...[
                SectionHeader(
                  title: 'Continue Learning',
                  onSeeAll: widget.onExploreCourses,
                ),
                const SizedBox(height: 14),
                ContinueLearningTile(
                  course: _continueCourse!,
                  progress: 0.65,
                  onResume: () => context.push('/courses/${_continueCourse!.id}'),
                ),
                const SizedBox(height: 24),
              ],
              SectionHeader(
                title: 'Trending Courses',
                onSeeAll: widget.onExploreCourses,
              ),
              const SizedBox(height: 14),
              _buildCoursesSection(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoriesSection() {
    if (_loading && _categories.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (_categories.isEmpty) {
      return _emptyHint('No categories published yet.');
    }

    return SizedBox(
      height: 110,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final category = _categories[index];
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: TopCategoryTile(
              category: category,
              onTap: () => context.push('/categories/${category.id}'),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCoursesSection() {
    if (_loading && _courses.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (_courses.isEmpty) {
      return _emptyHint('No courses published yet.');
    }

    return SizedBox(
      height: 220,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: _courses.length,
        itemBuilder: (context, index) {
          final course = _courses[index];
          return TrendingCourseTile(
            course: course,
            onTap: () => context.push('/courses/${course.id}'),
          );
        },
      ),
    );
  }

  Widget _emptyHint(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Text(text, style: TextStyle(color: Colors.grey.shade600)),
    );
  }
}

class _ConnectionBanner extends StatelessWidget {
  const _ConnectionBanner({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFFEF2F2),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFFECACA)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.wifi_off_rounded, color: Color(0xFFB91C1C), size: 20),
                SizedBox(width: 8),
                Text(
                  'Could not load courses',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: Color(0xFFB91C1C),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              message,
              style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
            ),
            const SizedBox(height: 4),
            Text(
              'API: ${AppConfig.apiBaseUrl}',
              style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 10),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(onPressed: onRetry, child: const Text('Retry')),
            ),
          ],
        ),
      ),
    );
  }
}
