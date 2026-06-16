import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
import '../core/utils/course_access.dart';
import '../core/utils/course_playability.dart';
import '../core/utils/course_playlist.dart';
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
    this.showPurchaseThanks = false,
  });

  final String courseId;
  final CourseService courseService;
  final bool showPurchaseThanks;

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  Course? _course;
  bool _loading = true;
  String? _error;
  bool _thanksShown = false;
  bool _postLoadHandled = false;

  @override
  void initState() {
    super.initState();
    _load(forceRefresh: widget.showPurchaseThanks);
  }

  Future<void> _load({bool forceRefresh = false}) async {
    final shouldForce = forceRefresh || widget.showPurchaseThanks;

    if (!shouldForce) {
      final cached = await widget.courseService.getCourseFullCached(widget.courseId);
      if (cached != null && mounted) {
        setState(() {
          _course = cached;
          _loading = false;
          _error = null;
        });
        _handlePostLoad(cached);
      } else if (_course == null && mounted) {
        setState(() => _loading = true);
      }
    } else if (mounted) {
      setState(() => _loading = _course == null);
    }

    try {
      final fresh = await widget.courseService.getCourseFull(
        widget.courseId,
        forceRefresh: shouldForce,
      );
      if (!mounted) return;
      setState(() {
        _course = fresh;
        _loading = false;
        _error = null;
      });
      _handlePostLoad(fresh);
    } catch (error) {
      if (!mounted) return;
      if (_course == null) {
        setState(() {
          _error = error.toString();
          _loading = false;
        });
      }
    }
  }

  void _handlePostLoad(Course course) {
    if (_postLoadHandled) return;
    _postLoadHandled = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      widget.courseService.warmCoursePlayback(course);
      _maybeShowPurchaseThanks(course);
    });
  }

  void _maybeShowPurchaseThanks(Course course) {
    if (!widget.showPurchaseThanks || _thanksShown || !mounted) return;
    _thanksShown = true;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      showDialog<void>(
        context: context,
        builder: (dialogContext) {
          final dc = dialogContext.colors;
          return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.celebration_rounded, color: AppColors.primary, size: 52),
              const SizedBox(height: 16),
              Text(
                'Thank you for purchasing!',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: dc.textPrimary,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'All videos in "${course.title}" are now unlocked. Happy learning!',
                textAlign: TextAlign.center,
                style: TextStyle(color: dc.textSecondary, height: 1.45),
              ),
            ],
          ),
          actions: [
            FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Start learning'),
            ),
          ],
        );
        },
      );
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

  void _openFirstVideo(Course course) {
    final playlist = courseVideoPlaylist(course);
    if (playlist.isEmpty) return;

    final first = playlist.first;
    final lesson = course.lessons.firstWhere(
      (item) => item.id == first.lessonId,
      orElse: () => course.lessons.first,
    );
    _onVideoTap(course, lesson, first.video.id, first.video.isLocked);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Course'),
        actions: [
          if (_course != null)
            SaveCourseButton(
              course: _course!,
              filledBackground: false,
              padding: const EdgeInsets.symmetric(horizontal: 16),
            ),
        ],
      ),
      body: _buildBody(context),
    );
  }

  Widget _buildBody(BuildContext context) {
    if (_loading && _course == null) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null && _course == null) {
      return ErrorView(
        message: _error!,
        onRetry: () => _load(forceRefresh: true),
      );
    }

    final rawCourse = _course;
    if (rawCourse == null) {
      return const Center(child: CircularProgressIndicator());
    }

    if (!CoursePlayability.isListable(rawCourse) ||
        rawCourse.lessons.every((l) => l.videos.isEmpty)) {
      return const EmptyState(
        title: 'Course unavailable',
        subtitle:
            'This course has no published videos yet. In admin, publish the course and its videos, then refresh.',
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
    final c = context.colors;

    return RefreshIndicator(
      onRefresh: () => _load(forceRefresh: true),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () => _openFirstVideo(course),
              borderRadius: BorderRadius.circular(12),
              child: ThumbnailImage(
                url: course.thumbnail,
                videoUrl: course.previewVideoUrl,
                showMediaOverlay: true,
                icon: Icons.play_circle_outline,
              ),
            ),
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
          ],
          const SizedBox(height: 16),
          Text(
            course.title,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: c.textPrimary,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            course.description,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: c.textSecondary,
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
                  color: c.textPrimary,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            needsPurchase
                ? '1 free demo video included. Purchase to unlock the rest.'
                : course.isPaid
                    ? 'Full course access active.'
                    : 'All videos are free to watch.',
            style: TextStyle(fontSize: 13, color: c.textSecondary),
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
                courseThumbnail: course.thumbnail,
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
    required this.courseThumbnail,
    required this.previewVideoId,
    required this.onVideoTap,
  });

  final Lesson lesson;
  final String? courseThumbnail;
  final String? previewVideoId;
  final void Function(String videoId, bool isLocked) onVideoTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
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
                    color: c.textPrimary,
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
                      url: courseThumbnail,
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
                      color: locked ? c.textSecondary : c.textPrimary,
                    ),
                  ),
                  subtitle: video.duration > 0 && !locked && !isPreview
                      ? Text(
                          _formatDuration(video.duration),
                          style: TextStyle(color: c.textSecondary),
                        )
                      : null,
                  trailing: locked
                      ? _VideoStatusTag(label: 'Locked', locked: true)
                      : isPreview
                          ? const _VideoStatusTag(label: 'Preview', locked: false)
                          : Icon(Icons.chevron_right, color: c.textSecondary),
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
    final c = context.colors;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: locked
            ? c.border.withValues(alpha: 0.4)
            : AppColors.accentGreen.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(99),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (locked) ...[
            Icon(Icons.lock_outline, size: 12, color: c.textSecondary),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: locked ? c.textSecondary : AppColors.accentGreen,
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
    final c = context.colors;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: highlight
            ? AppColors.accentGreen.withValues(alpha: 0.12)
            : c.surfaceElevated,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: highlight
              ? AppColors.accentGreen.withValues(alpha: 0.35)
              : c.border,
        ),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: highlight ? AppColors.accentGreen : c.textPrimary,
            ),
      ),
    );
  }
}
