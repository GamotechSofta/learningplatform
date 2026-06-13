import 'package:chewie/chewie.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:video_player/video_player.dart';

import '../core/theme/app_colors.dart';
import '../core/utils/course_access.dart';
import '../core/utils/notification_sync.dart';
import '../core/utils/video_playback.dart';
import '../models/certificate.dart';
import '../models/course.dart';
import '../models/video.dart';
import '../providers/auth_provider.dart';
import '../providers/learning_progress_provider.dart';
import '../providers/subscription_provider.dart';
import '../services/course_service.dart';
import '../widgets/certificate_card.dart';
import '../widgets/error_view.dart';
import '../widgets/purchase_dialog.dart';
import '../widgets/thumbnail_image.dart';
import '../widgets/video/video_player_info_panel.dart';
import '../widgets/video/video_up_next_list.dart';

class VideoPlayerScreen extends StatefulWidget {
  const VideoPlayerScreen({
    super.key,
    required this.courseId,
    required this.lessonId,
    required this.videoId,
    required this.courseService,
  });

  final String courseId;
  final String lessonId;
  final String videoId;
  final CourseService courseService;

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  String? _error;
  String _title = 'Video';
  String _lessonTitle = '';
  int _videoDuration = 0;
  Course? _course;
  bool _locked = false;
  bool _isPurchased = false;
  bool _completionHandled = false;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadVideo();
  }

  @override
  void didUpdateWidget(VideoPlayerScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.videoId != widget.videoId ||
        oldWidget.lessonId != widget.lessonId) {
      _completionHandled = false;
      _title = 'Video';
      _loadVideo();
    }
  }

  Future<void> _loadVideo() async {
    setState(() {
      _loading = true;
      _error = null;
      _locked = false;
    });

    await _disposePlayer();

    try {
      if (!mounted) return;
      final subs = context.read<SubscriptionProvider>();
      final rawCourse = await widget.courseService.getCourseFull(widget.courseId);
      final subscriptionActive = subs.hasAccess(rawCourse.id);
      final isPurchased = CourseAccess.isCoursePurchased(
        rawCourse,
        subscriptionActive: subscriptionActive,
      );
      final hasFullAccess = CourseAccess.hasFullPlaybackAccess(
        rawCourse,
        subscriptionActive: subscriptionActive,
      );
      final course = CourseAccess.applyPlaybackLocks(
        rawCourse,
        subscriptionActive: subscriptionActive,
      );

      VideoItem? video;
      String lessonTitle = '';
      for (final lesson in course.lessons) {
        for (final item in lesson.videos) {
          if (item.id == widget.videoId) {
            video = item;
            lessonTitle = lesson.title;
            break;
          }
        }
        if (video != null) break;
      }

      if (video == null) {
        throw Exception('Video not found in this course');
      }

      _title = video.title;
      _lessonTitle = lessonTitle;
      _videoDuration = video.duration;
      _course = course;
      _isPurchased = isPurchased;

      final playbackUrl = VideoPlayback.resolveUrl(video.videoUrl);
      final paywalled = course.isPaid && !hasFullAccess;

      if (video.isLocked || (paywalled && playbackUrl.isEmpty)) {
        if (!mounted) return;
        setState(() {
          _locked = true;
          _loading = false;
        });
        return;
      }

      if (playbackUrl.isEmpty) {
        throw Exception('This video file is not available yet.');
      }

      if (!VideoPlayback.isEmbeddableStream(playbackUrl)) {
        throw Exception(
          'This video uses an external link that cannot be played in the app.',
        );
      }

      final controller = VideoPlayerController.networkUrl(
        Uri.parse(playbackUrl),
        videoPlayerOptions: VideoPlayerOptions(
          mixWithOthers: true,
          allowBackgroundPlayback: false,
        ),
      );

      await controller.initialize().timeout(
        const Duration(seconds: 60),
        onTimeout: () => throw Exception(
          'Video is taking too long to load. Check your connection and try again.',
        ),
      );

      controller.addListener(_onPlaybackUpdate);

      if (!mounted) {
        await controller.dispose();
        return;
      }

      setState(() {
        _videoController = controller;
        _chewieController = ChewieController(
          videoPlayerController: controller,
          autoPlay: true,
          looping: false,
          allowFullScreen: true,
          allowMuting: true,
          allowPlaybackSpeedChanging: true,
          showControlsOnInitialize: true,
          aspectRatio: controller.value.aspectRatio == 0
              ? 16 / 9
              : controller.value.aspectRatio,
          materialProgressColors: ChewieProgressColors(
            playedColor: AppColors.primary,
            handleColor: AppColors.primary,
            bufferedColor: Colors.white24,
            backgroundColor: Colors.white12,
          ),
          placeholder: const ColoredBox(color: Colors.black),
        );
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = VideoPlayback.friendlyError(error);
        _loading = false;
      });
    }
  }

  Future<void> _disposePlayer() async {
    _videoController?.removeListener(_onPlaybackUpdate);
    _chewieController?.dispose();
    await _videoController?.dispose();
    _chewieController = null;
    _videoController = null;
  }

  void _onPlaybackUpdate() {
    final controller = _videoController;
    final course = _course;
    if (controller == null ||
        course == null ||
        _completionHandled ||
        !controller.value.isInitialized) {
      return;
    }

    final duration = controller.value.duration;
    final position = controller.value.position;
    if (duration.inMilliseconds <= 0) return;

    final nearEnd = position >= duration - const Duration(seconds: 2);
    if (!nearEnd) return;

    _completionHandled = true;
    _handleVideoCompleted(course);
  }

  Future<void> _handleVideoCompleted(Course course) async {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated || auth.user == null) return;

    final progress = context.read<LearningProgressProvider>();
    final certificate = await progress.markVideoWatched(
      userId: auth.user!.id,
      course: course,
      lessonId: widget.lessonId,
      videoId: widget.videoId,
      isPurchased: _isPurchased,
      studentName: auth.user!.name,
    );

    if (!mounted) return;

    await syncUserNotifications(context);

    if (!mounted) return;

    if (certificate != null) {
      await _showCertificateDialog(certificate);
      return;
    }

    final next = _nextPlayableAfterCurrent(course);
    if (next != null && mounted) {
      _playVideo(next);
    }
  }

  CourseVideoEntry? _nextPlayableAfterCurrent(Course course) {
    final playlist = courseVideoPlaylist(course);
    final currentIndex = playlist.indexWhere((e) => e.video.id == widget.videoId);
    if (currentIndex < 0) return null;

    for (var i = currentIndex + 1; i < playlist.length; i++) {
      final entry = playlist[i];
      if (!entry.video.isLocked && entry.video.videoUrl.isNotEmpty) {
        return entry;
      }
    }
    return null;
  }

  void _playVideo(CourseVideoEntry entry) {
    if (entry.video.id == widget.videoId) return;
    context.replace(
      '/courses/${widget.courseId}/lessons/${entry.lessonId}/videos/${entry.video.id}',
    );
  }

  void _onUpNextTap(CourseVideoEntry entry) {
    if (entry.video.isLocked) {
      if (_course != null) {
        PurchaseDialog.show(context, _course!);
      }
      return;
    }
    _playVideo(entry);
  }

  Future<void> _showCertificateDialog(CourseCertificate certificate) async {
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AlertDialog(
          contentPadding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Congratulations!',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Text(
                  'You completed ${_course?.title ?? 'the course'}.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
                const SizedBox(height: 16),
                CertificateCard(certificate: certificate, compact: true),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Close'),
            ),
            FilledButton(
              onPressed: () {
                Navigator.of(dialogContext).pop();
                context.push('/certificates/${certificate.id}');
              },
              child: const Text('View certificate'),
            ),
          ],
        );
      },
    );
  }

  void _openCheckout() {
    if (_course == null) return;
    context.push('/courses/${_course!.id}/checkout');
  }

  @override
  void dispose() {
    _disposePlayer();
    super.dispose();
  }

  Widget _buildPlayerSlot() {
    if (_locked) {
      return AspectRatio(
        aspectRatio: 16 / 9,
        child: Stack(
          fit: StackFit.expand,
          children: [
            ThumbnailImage(
              borderRadius: 0,
              blurPreview: true,
              icon: Icons.lock_rounded,
            ),
            Container(
              color: Colors.black.withValues(alpha: 0.35),
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _title,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Purchase this course to unlock all lessons',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                  if (_course != null) ...[
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: _openCheckout,
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                      ),
                      child: Text('Unlock from ${_course!.pricing.displayPrice}'),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      );
    }

    if (_loading || _chewieController == null) {
      return const AspectRatio(
        aspectRatio: 16 / 9,
        child: ColoredBox(
          color: Colors.black,
          child: Center(
            child: CircularProgressIndicator(
              color: AppColors.primary,
              strokeWidth: 2.5,
            ),
          ),
        ),
      );
    }

    return AspectRatio(
      aspectRatio: _videoController!.value.aspectRatio == 0
          ? 16 / 9
          : _videoController!.value.aspectRatio,
      child: Chewie(controller: _chewieController!),
    );
  }

  Widget _buildContentSheet({required Set<String> watchedIds}) {
    final course = _course!;

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 4),
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(99),
              ),
            ),
          ),
          VideoPlayerInfoPanel(
            course: course,
            videoTitle: _title,
            lessonTitle: _lessonTitle.isEmpty ? 'Lesson' : _lessonTitle,
            videoDurationSeconds: _videoDuration,
            isWatched: watchedIds.contains(widget.videoId),
          ),
          const Divider(height: 1, color: AppColors.border),
          VideoUpNextList(
            course: course,
            currentVideoId: widget.videoId,
            watchedVideoIds: watchedIds,
            onVideoSelected: _onUpNextTap,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final progress = context.watch<LearningProgressProvider>();
    final watchedIds = progress.watchedVideoIds(widget.courseId).toSet();

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
        title: Text(
          _course?.title ?? 'Course',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
      body: _error != null
          ? ColoredBox(
              color: AppColors.background,
              child: ErrorView(message: _error!, onRetry: _loadVideo),
            )
          : _course == null
              ? const ColoredBox(
                  color: Colors.black,
                  child: Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildPlayerSlot(),
                    Expanded(
                      child: _buildContentSheet(watchedIds: watchedIds),
                    ),
                  ],
                ),
    );
  }
}

