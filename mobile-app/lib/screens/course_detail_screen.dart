import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../core/utils/course_access.dart';
import '../core/utils/course_playability.dart';
import '../models/course.dart';
import '../models/lesson.dart';
import '../providers/subscription_provider.dart';
import '../services/course_service.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_view.dart';
import '../widgets/purchase_dialog.dart';
import '../widgets/save_course_button.dart';
import '../widgets/thumbnail_image.dart';

class CourseDetailScreen extends StatefulWidget {
  const CourseDetailScreen({
    super.key,
    required this.courseId,
    required this.courseService,
  });

  final String courseId;
  final CourseService courseService;

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  late Future<Course> _future;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    setState(() {
      _future = widget.courseService.getCourseFull(widget.courseId);
    });
  }

  void _openCheckout(String courseId) {
    context.push('/courses/$courseId/checkout');
  }

  void _onVideoTap(Course course, Lesson lesson, String videoId, bool isLocked) {
    if (isLocked) {
      PurchaseDialog.show(context, course);
      return;
    }
    context.push('/courses/${course.id}/lessons/${lesson.id}/videos/$videoId');
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Course>(
        future: _future,
        builder: (context, snapshot) {
          return Scaffold(
            appBar: AppBar(
              title: const Text('Course'),
              actions: [
                if (snapshot.hasData)
                  SaveCourseButton(
                    course: snapshot.data!,
                    filledBackground: false,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                  ),
              ],
            ),
            body: _buildBody(context, snapshot),
          );
        },
      );
  }

  Widget _buildBody(BuildContext context, AsyncSnapshot<Course> snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return ErrorView(
              message: snapshot.error.toString(),
              onRetry: _load,
            );
          }

          final rawCourse = snapshot.data!;

          if (!CoursePlayability.isListable(rawCourse) ||
              rawCourse.lessons.every((l) => l.videos.isEmpty)) {
            return const EmptyState(
              title: 'Course unavailable',
              subtitle:
                  'This course has no playable videos right now. It may be temporarily hidden.',
            );
          }

          final subs = context.watch<SubscriptionProvider>();
          final subscriptionActive = subs.hasAccess(rawCourse.id);
          final isPurchased = CourseAccess.isCoursePurchased(
            rawCourse,
            subscriptionActive: subscriptionActive,
          );
          final course = CourseAccess.applyPlaybackLocks(
            rawCourse,
            subscriptionActive: subscriptionActive,
          );
          final lessons = course.lessons.where((l) => l.videos.isNotEmpty).toList();
          final needsPurchase = course.isPaid && !isPurchased;
          final previewVideoId = CourseAccess.firstPlayableVideoId(course);

          return RefreshIndicator(
            onRefresh: () async => _load(),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              children: [
                ThumbnailImage(
                  url: course.thumbnail,
                  videoUrl: course.previewVideoUrl,
                  showMediaOverlay: true,
                  icon: Icons.play_circle_outline,
                ),
                if (needsPurchase) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: () => _openCheckout(course.id),
                      icon: const Icon(Icons.shopping_cart_checkout_rounded),
                      label: Text('Purchase course • ${course.pricing.displayPrice}'),
                    ),
                  ),
                ] else if (course.isPaid && isPurchased) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.accentGreen.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.accentGreen.withValues(alpha: 0.35)),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.verified_rounded, color: AppColors.accentGreen),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Purchased — all videos unlocked',
                            style: TextStyle(
                              color: AppColors.accentGreen,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                Text(
                  course.title,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  course.description,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _MetaChip(label: course.level),
                    if (course.instructorName != null)
                      _MetaChip(label: course.instructorName!),
                    _MetaChip(label: course.pricing.displayPrice),
                    _MetaChip(label: '${course.videoCount} videos'),
                    if (course.isPaid)
                      _MetaChip(
                        label: isPurchased ? 'Purchased' : 'Premium',
                        highlight: isPurchased,
                      ),
                  ],
                ),
                const SizedBox(height: 24),
                Text(
                  'Lessons',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 6),
                Text(
                  needsPurchase
                      ? '1 free demo video included. Purchase to unlock the rest.'
                      : course.isPaid
                          ? 'Full course access active.'
                          : 'All videos are free to watch.',
                  style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 12),
                if (lessons.isEmpty)
                  const EmptyState(
                    title: 'No published lessons',
                    subtitle: 'Add and publish lessons from the admin panel.',
                  )
                else
                  ...lessons.map(
                    (lesson) => _LessonSection(
                      lesson: lesson,
                      previewVideoId: previewVideoId,
                      onVideoTap: (videoId, isLocked) =>
                          _onVideoTap(course, lesson, videoId, isLocked),
                    ),
                  ),
              ],
            ),
          );
  }
}

class _LessonSection extends StatelessWidget {
  const _LessonSection({
    required this.lesson,
    required this.previewVideoId,
    required this.onVideoTap,
  });

  final Lesson lesson;
  final String? previewVideoId;
  final void Function(String videoId, bool isLocked) onVideoTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              lesson.title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 12),
            ...lesson.videos.map(
              (video) {
                final locked = video.isLocked;
                final isPreview = !locked && previewVideoId == video.id;

                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: ThumbnailImage(
                      url: locked ? null : video.thumbnail,
                      videoUrl: locked ? null : video.frameSourceUrl,
                      width: 48,
                      height: 48,
                      borderRadius: 0,
                      fit: BoxFit.cover,
                      blurPreview: locked,
                      showMediaOverlay: !locked,
                      icon: locked ? Icons.lock_rounded : Icons.play_arrow,
                      mediaOverlayIcon: Icons.play_arrow,
                    ),
                  ),
                  title: Text(
                    video.title,
                    style: TextStyle(
                      color: locked ? AppColors.textSecondary : AppColors.textPrimary,
                    ),
                  ),
                  subtitle: video.duration > 0 && !locked && !isPreview
                      ? Text(_formatDuration(video.duration))
                      : null,
                  trailing: locked
                      ? _VideoStatusTag(label: 'Locked', locked: true)
                      : isPreview
                          ? const _VideoStatusTag(label: 'Preview', locked: false)
                          : const Icon(Icons.chevron_right),
                  onTap: () => onVideoTap(video.id, locked),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  String _formatDuration(int seconds) {
    final minutes = seconds ~/ 60;
    final remaining = seconds % 60;
    return '${minutes}m ${remaining}s';
  }
}

class _VideoStatusTag extends StatelessWidget {
  const _VideoStatusTag({required this.label, required this.locked});

  final String label;
  final bool locked;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: locked ? AppColors.border.withValues(alpha: 0.4) : AppColors.accentGreen.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(99),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (locked) ...[
            const Icon(Icons.lock_outline, size: 12, color: AppColors.textSecondary),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: locked ? AppColors.textSecondary : AppColors.accentGreen,
            ),
          ),
        ],
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.label, this.highlight = false});

  final String label;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: highlight ? AppColors.accentGreen.withValues(alpha: 0.12) : AppColors.surface,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: highlight ? AppColors.accentGreen.withValues(alpha: 0.35) : AppColors.border,
        ),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: highlight ? AppColors.accentGreen : AppColors.textPrimary,
            ),
      ),
    );
  }
}
