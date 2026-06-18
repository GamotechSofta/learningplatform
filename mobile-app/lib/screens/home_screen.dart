import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../core/constants/learning_tracks.dart';
import '../core/utils/course_recommendations.dart';
import '../models/category.dart';
import '../models/course.dart';
import '../providers/catalog_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/learning_progress_provider.dart';
import '../providers/subscription_provider.dart';
import '../services/category_service.dart';
import '../services/course_service.dart';
import '../navigation/main_shell_scope.dart';
import '../core/theme/themed_colors.dart';
import '../core/utils/resume_learning_flow.dart';
import '../widgets/home/continue_learning_hero.dart';
import '../widgets/skeleton/home_skeleton.dart';
import '../widgets/skeleton/skeleton_box.dart';
import '../widgets/home/hero_banner.dart';
import '../widgets/home/home_compact_course_row.dart';
import '../widgets/home/home_feature_highlights.dart';
import '../widgets/home/home_header.dart';
import '../widgets/home/home_learning_snapshot.dart';
import '../widgets/home/home_quick_actions.dart';
import '../widgets/home/home_search_bar.dart';
import '../widgets/home/recommended_courses_carousel.dart';
import '../widgets/home/section_header.dart';
import '../widgets/home/top_category_tile.dart';
import '../core/utils/notification_sync.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    required this.categoryService,
    required this.courseService,
    this.onExploreCourses,
  });

  final CategoryService categoryService;
  final CourseService courseService;
  final VoidCallback? onExploreCourses;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await context.read<CatalogProvider>().load();
      if (!mounted) return;
      await maybeShowResumePrompt(
        context: context,
        courseService: widget.courseService,
      );
    });
  }

  Future<void> _resumeCourse(Course course) async {
    try {
      await resumeCoursePlayback(
        context: context,
        course: course,
        courseService: widget.courseService,
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  Future<void> _refreshLearningData({bool forceRefresh = false}) async {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated || auth.user == null) return;

    try {
      await Future.wait([
        context.read<SubscriptionProvider>().refresh(
              auth.user!.id,
              forceRefresh: forceRefresh,
            ),
        context.read<LearningProgressProvider>().loadForUser(auth.user!.id),
      ]);
      if (mounted) {
        await syncUserNotifications(context);
      }
    } catch (_) {
      // Non-blocking — home content still loads from public course APIs.
    }
  }

  Future<void> _refreshAll() async {
    await Future.wait([
      context.read<CatalogProvider>().load(forceRefresh: true),
      _refreshLearningData(forceRefresh: true),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final auth = context.watch<AuthProvider>();
    final catalog = context.watch<CatalogProvider>();
    final subs = context.watch<SubscriptionProvider>();
    final progress = context.watch<LearningProgressProvider>();

    final categories = catalog.categories;
    final courses = catalog.courses;
    final loading = catalog.loading;
    final error = catalog.error;

    final purchasedCourses =
        subs.activeSubscriptions.map((sub) => sub.course).toList();
    final continueCourse = auth.isAuthenticated
        ? progress.pickContinueCourse(purchasedCourses)
        : null;

    final courseProgress = continueCourse == null
        ? 0.0
        : progress.progressForCourse(
            continueCourse.id,
            continueCourse.videoCount,
          );
    final watchedCount = continueCourse == null
        ? 0
        : progress.watchedCountFor(continueCourse.id);
    final totalCount = continueCourse == null
        ? 0
        : progress.totalVideosFor(
            continueCourse.id,
            fallback: continueCourse.videoCount,
          );

    final videosWatched = purchasedCourses.fold<int>(
      0,
      (sum, course) => sum + progress.watchedCountFor(course.id),
    );
    final coursesInProgress = purchasedCourses.where((course) {
      final watched = progress.watchedCountFor(course.id);
      if (watched == 0) return false;
      return progress.progressForCourse(course.id, course.videoCount) < 1.0;
    }).length;
    final freeCourses = courses
        .where((course) => !course.pricing.isPaid)
        .take(3)
        .toList();

    final coursesCompleted = purchasedCourses
        .where((course) => progress.progressForCourse(course.id, course.videoCount) >= 1.0)
        .length;

    return Scaffold(
      backgroundColor: c.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refreshAll,
          child: ListView(
            padding: const EdgeInsets.only(bottom: 24),
            children: [
              const HomeHeader(),
              if (continueCourse != null) ...[
                ContinueLearningHero(
                  course: continueCourse,
                  progress: courseProgress,
                  watchedCount: watchedCount,
                  totalCount: totalCount > 0 ? totalCount : null,
                  onResume: () => _resumeCourse(continueCourse),
                ),
                const SizedBox(height: 20),
              ] else if (loading && !catalog.loaded) ...[
                const HomeSkeleton(),
              ],
              if (!loading || catalog.loaded) ...[
                const HomeSearchBar(),
                const HeroBanner(),
                HomeQuickActions(onBrowseCourses: widget.onExploreCourses),
              ],
              if (error != null) ...[
                const SizedBox(height: 12),
                _ConnectionBanner(message: error, onRetry: _refreshAll),
              ],
              const SizedBox(height: 24),
              SectionHeader(
                title: 'Top Categories',
                onSeeAll: widget.onExploreCourses,
              ),
              const SizedBox(height: 14),
              _buildCategoriesSection(
                CourseRecommendations.categoriesForTrack(
                  categories,
                  auth.user?.learningTrack,
                ),
                loading: loading,
              ),
              const SizedBox(height: 24),
              SectionHeader(
                title: _recommendedSectionTitle(auth.user?.learningTrack),
                onSeeAll: widget.onExploreCourses,
              ),
              SectionSubtitle(
                _recommendedSectionSubtitle(auth.user?.learningTrack) ?? '',
              ),
              const SizedBox(height: 10),
              _buildCoursesSection(
                courses,
                auth.user?.learningTrack,
                loading: loading,
              ),
              if (auth.isAuthenticated) ...[
                SizedBox(height: 24),
                HomeLearningSnapshot(
                  videosWatched: videosWatched,
                  coursesInProgress: coursesInProgress,
                  coursesCompleted: coursesCompleted,
                  learningTrack: auth.user?.learningTrack,
                  onOpenLearning: () => MainShellScope.of(context).selectTab(2),
                ),
              ],
              if (freeCourses.isNotEmpty) ...[
                SizedBox(height: 24),
                const SectionHeader(title: 'Free to Start'),
                SizedBox(height: 6),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    'Try these courses at no cost — no payment needed to begin.',
                    style: TextStyle(
                      fontSize: 13,
                      color: c.textSecondary,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                ...freeCourses.map(
                  (course) => HomeCompactCourseRow(
                    course: course,
                    badge: 'Free',
                    onTap: () {
                      context.read<CatalogProvider>().prefetchCourseDetail(course.id);
                      context.push('/courses/${course.id}');
                    },
                  ),
                ),
              ],
              const SizedBox(height: 28),
              const HomeFeatureHighlights(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoriesSection(
    List<Category> categories, {
    required bool loading,
  }) {
    if (loading && categories.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 20),
        child: SkeletonBox(width: double.infinity, height: 110, borderRadius: 16),
      );
    }

    if (categories.isEmpty) {
      return _emptyHint('No categories published yet.');
    }

    return SizedBox(
      height: 110,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
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

  String _recommendedSectionTitle(String? track) {
    if (track != null &&
        track.isNotEmpty &&
        track != LearningTracks.exploreAll) {
      return 'Recommended for You';
    }
    return 'Popular Courses';
  }

  String? _recommendedSectionSubtitle(String? track) {
    if (track != null &&
        track.isNotEmpty &&
        track != LearningTracks.exploreAll) {
      return 'Hand-picked for ${LearningTracks.label(track)} based on your learning track';
    }
    return 'Courses students are watching right now';
  }

  Widget _buildCoursesSection(
    List<Course> courses,
    String? learningTrack, {
    required bool loading,
  }) {
    final recommended = CourseRecommendations.forTrack(
      courses: courses,
      learningTrack: learningTrack,
      limit: 6,
    );

    if (loading && recommended.isEmpty) {
      return const HomeSkeleton();
    }

    if (recommended.isEmpty) {
      return _emptyHint('No courses available yet.');
    }

    return RecommendedCoursesCarousel(
      courses: recommended,
      showRank: learningTrack != null &&
          learningTrack.isNotEmpty &&
          learningTrack != LearningTracks.exploreAll,
      onCourseTap: (course) {
        context.read<CatalogProvider>().prefetchCourseDetail(course.id);
        context.push('/courses/${course.id}');
      },
    );
  }

  Widget _emptyHint(String text) {
    final c = context.colors;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Text(text, style: TextStyle(color: c.textSecondary)),
    );
  }
}

class _ConnectionBanner extends StatelessWidget {
  const _ConnectionBanner({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.error.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.error.withValues(alpha: 0.35)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.wifi_off_rounded, color: AppColors.error, size: 20),
                SizedBox(width: 8),
                Text(
                  'Could not load courses',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AppColors.error,
                  ),
                ),
              ],
            ),
            SizedBox(height: 6),
            Text(
              message,
              style: TextStyle(fontSize: 12, color: c.textSecondary),
            ),
            const SizedBox(height: 4),
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
