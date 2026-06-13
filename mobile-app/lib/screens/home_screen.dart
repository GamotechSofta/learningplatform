import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../core/constants/learning_tracks.dart';
import '../core/utils/api_errors.dart';
import '../core/utils/course_access.dart';
import '../core/utils/course_recommendations.dart';
import '../models/category.dart';
import '../models/course.dart';
import '../providers/auth_provider.dart';
import '../providers/learning_progress_provider.dart';
import '../providers/subscription_provider.dart';
import '../services/category_service.dart';
import '../services/course_service.dart';
import '../navigation/main_shell_scope.dart';
import '../widgets/home/continue_learning_tile.dart';
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
  List<Category> _categories = [];
  List<Course> _courses = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
    WidgetsBinding.instance.addPostFrameCallback((_) => _refreshLearningData());
  }

  Future<void> _refreshLearningData() async {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated || auth.user == null) return;

    try {
      await Future.wait([
        context.read<SubscriptionProvider>().refresh(auth.user!.id),
        context.read<LearningProgressProvider>().loadForUser(auth.user!.id),
      ]);
      if (mounted) {
        await syncUserNotifications(context);
      }
    } catch (_) {
      // Non-blocking — home content still loads from public course APIs.
    }
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final results = await Future.wait([
        widget.categoryService.getPublishedCategories(),
        widget.courseService.getPublishedCourses(),
      ]);

      if (!mounted) return;
      setState(() {
        _categories = results[0] as List<Category>;
        _courses = results[1] as List<Course>;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = ApiErrors.friendlyMessage(error);
      });
    }
  }

  Future<void> _refreshAll() async {
    await Future.wait([
      _load(),
      _refreshLearningData(),
    ]);
  }

  Future<void> _resumeCourse(Course course) async {
    try {
      final subs = context.read<SubscriptionProvider>();
      final progress = context.read<LearningProgressProvider>();
      final subscriptionActive = subs.hasAccess(course.id);

      final rawCourse = await widget.courseService.getCourseFull(course.id);
      final isPurchased = CourseAccess.isCoursePurchased(
        rawCourse,
        subscriptionActive: subscriptionActive,
      );
      final fullCourse = CourseAccess.applyPlaybackLocks(
        rawCourse,
        subscriptionActive: subscriptionActive,
      );
      final next = progress.nextVideoToWatch(
        fullCourse,
        isPurchased: isPurchased,
      );

      if (!mounted) return;

      if (next != null) {
        context.push(
          '/courses/${course.id}/lessons/${next.lessonId}/videos/${next.videoId}',
        );
      } else {
        context.push('/courses/${course.id}');
      }
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final subs = context.watch<SubscriptionProvider>();
    final progress = context.watch<LearningProgressProvider>();

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
    final freeCourses = _courses
        .where((course) => !course.pricing.isPaid)
        .take(3)
        .toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refreshAll,
          child: ListView(
            padding: const EdgeInsets.only(bottom: 24),
            children: [
              const HomeHeader(),
              const HomeSearchBar(),
              const HeroBanner(),
              HomeQuickActions(onBrowseCourses: widget.onExploreCourses),
              if (_error != null) ...[
                const SizedBox(height: 12),
                _ConnectionBanner(message: _error!, onRetry: _refreshAll),
              ],
              const SizedBox(height: 24),
              SectionHeader(
                title: 'Top Categories',
                onSeeAll: widget.onExploreCourses,
              ),
              const SizedBox(height: 14),
              _buildCategoriesSection(
                CourseRecommendations.categoriesForTrack(
                  _categories,
                  auth.user?.learningTrack,
                ),
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
              _buildCoursesSection(auth.user?.learningTrack),
              if (auth.isAuthenticated) ...[
                const SizedBox(height: 24),
                HomeLearningSnapshot(
                  videosWatched: videosWatched,
                  coursesInProgress: coursesInProgress,
                  certificatesEarned: progress.certificates.length,
                  learningTrack: auth.user?.learningTrack,
                  onOpenLearning: () => MainShellScope.of(context).selectTab(2),
                ),
              ],
              if (continueCourse != null) ...[
                const SizedBox(height: 24),
                SectionHeader(
                  title: 'Continue Learning',
                  onSeeAll: () => MainShellScope.of(context).selectTab(2),
                ),
                const SizedBox(height: 14),
                ContinueLearningTile(
                  course: continueCourse,
                  progress: courseProgress,
                  watchedCount: watchedCount,
                  totalCount: totalCount > 0 ? totalCount : null,
                  resumeLabel: watchedCount > 0 ? 'Resume' : 'Start',
                  onResume: () => _resumeCourse(continueCourse),
                ),
              ],
              if (freeCourses.isNotEmpty) ...[
                const SizedBox(height: 24),
                const SectionHeader(title: 'Free to Start'),
                const SizedBox(height: 6),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    'Try these courses at no cost — no payment needed to begin.',
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                ...freeCourses.map(
                  (course) => HomeCompactCourseRow(
                    course: course,
                    badge: 'Free',
                    onTap: () => context.push('/courses/${course.id}'),
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

  Widget _buildCategoriesSection(List<Category> categories) {
    if (_loading && categories.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: CircularProgressIndicator()),
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

  Widget _buildCoursesSection(String? learningTrack) {
    final recommended = CourseRecommendations.forTrack(
      courses: _courses,
      learningTrack: learningTrack,
      limit: 6,
    );

    if (_loading && recommended.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (recommended.isEmpty) {
      return _emptyHint('No courses available yet.');
    }

    return RecommendedCoursesCarousel(
      courses: recommended,
      showRank: learningTrack != null &&
          learningTrack.isNotEmpty &&
          learningTrack != LearningTracks.exploreAll,
      onCourseTap: (course) => context.push('/courses/${course.id}'),
    );
  }

  Widget _emptyHint(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Text(text, style: const TextStyle(color: AppColors.textSecondary)),
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
          color: AppColors.error.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.error.withValues(alpha: 0.35)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
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
            const SizedBox(height: 6),
            Text(
              message,
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
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
