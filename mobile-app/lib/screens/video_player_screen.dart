import 'dart:async';
import 'dart:io';

import 'package:chewie/chewie.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:video_player/video_player.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
import '../core/utils/course_access.dart';
import '../core/utils/course_playlist.dart';
import '../core/utils/notification_sync.dart';
import '../core/utils/video_playback.dart';
import '../core/utils/video_playback_session.dart';
import '../models/course.dart';
import '../providers/auth_provider.dart';
import '../providers/learning_progress_provider.dart';
import '../providers/subscription_provider.dart';
import '../providers/video_engagement_provider.dart';
import '../services/course_service.dart';
import '../widgets/error_view.dart';
import '../widgets/page_app_bar.dart';
import '../widgets/purchase_dialog.dart';
import '../widgets/thumbnail_image.dart';
import '../widgets/video/video_action_bar.dart';
import '../widgets/video/video_next_overlay.dart';
import '../widgets/video/video_player_info_panel.dart';
import '../widgets/video/video_transport_bar.dart';
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

class _VideoPlayerScreenState extends State<VideoPlayerScreen>
    with WidgetsBindingObserver {
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
  bool _isBuffering = false;
  String? _posterUrl;
  String? _streamLabel;
  String _downloadUrl = '';
  CourseVideoEntry? _nextEntry;
  CourseVideoEntry? _previousEntry;
  bool _showAutoplayOverlay = false;
  int _autoplaySecondsLeft = 5;
  bool _autoplayCancelled = false;
  Timer? _overlayTimer;

  static const _autoplayLeadTime = Duration(seconds: 5);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadVideo();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive ||
        state == AppLifecycleState.hidden) {
      unawaited(_pausePlayback());
    }
  }

  Future<void> _pausePlayback() async {
    _stopPlayback();
  }

  /// Pause immediately when leaving the screen (sync — safe from dispose/deactivate).
  void _stopPlayback() {
    _cancelAutoplayOverlay();

    final controller = _videoController;
    if (controller != null && controller.value.isInitialized) {
      try {
        controller.pause();
      } catch (_) {}
    }

    try {
      _chewieController?.pause();
    } catch (_) {}

    unawaited(VideoPlaybackSession.instance.pauseActive());
  }

  @override
  void didUpdateWidget(VideoPlayerScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.videoId != widget.videoId ||
        oldWidget.lessonId != widget.lessonId) {
      _completionHandled = false;
      _autoplayCancelled = false;
      _cancelAutoplayOverlay();
      _title = 'Video';
      _loadVideo();
    }
  }

  Future<void> _loadVideo() async {
    setState(() {
      _loading = true;
      _error = null;
      _locked = false;
      _nextEntry = null;
      _previousEntry = null;
      _showAutoplayOverlay = false;
      _isBuffering = false;
      _posterUrl = null;
      _streamLabel = null;
      _downloadUrl = '';
    });

    _cancelAutoplayOverlay();
    await _disposePlayer();

    try {
      if (!mounted) return;
      final subs = context.read<SubscriptionProvider>();
      final engagement = context.read<VideoEngagementProvider>();
      final cachedCourse = widget.courseService.peekCourseFull(widget.courseId);

      if (cachedCourse != null) {
        _applyCourseContext(cachedCourse, subs);
        setState(() {});
      }

      final playbackFuture = widget.courseService.getVideoPlayback(
        widget.courseId,
        widget.videoId,
      );

      final needsFreshCourse = cachedCourse == null ||
          subs.hasAccess(widget.courseId);

      if (cachedCourse != null && needsFreshCourse) {
        unawaited(_refreshCourseInBackground(subs));
      }

      final playback = await playbackFuture;

      Course rawCourse = cachedCourse ??
          await widget.courseService.getCourseFull(widget.courseId);

      if (cachedCourse == null) {
        _applyCourseContext(rawCourse, subs);
      }

      _title = playback.title;
      _lessonTitle = playback.lessonTitle;
      _videoDuration = playback.duration;
      _posterUrl = playback.thumbnail ?? rawCourse.thumbnail;

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

      _course = course;
      _isPurchased = isPurchased;
      _nextEntry = nextPlayableVideo(course, widget.videoId);
      _previousEntry = previousPlayableVideo(course, widget.videoId);

      final mp4Url = VideoPlayback.resolveUrl(playback.videoUrl);
      if (mp4Url.isNotEmpty &&
          !VideoPlayback.isHlsManifest(mp4Url) &&
          VideoPlayback.isEmbeddableStream(mp4Url)) {
        _downloadUrl = mp4Url;
      }

      final playbackUrl = VideoPlayback.resolvePlaybackSource(
        hlsUrl: playback.hlsUrl,
        mp4Url: playback.videoUrl,
        streamingStatus: playback.streamingStatus,
      );
      final paywalled = course.isPaid && !hasFullAccess;

      if (playback.isLocked || (paywalled && playbackUrl.isEmpty)) {
        if (!mounted) return;
        setState(() {
          _locked = true;
          _loading = false;
        });
        return;
      }

      String sourceUrl = playbackUrl;
      final offline = engagement.downloadFor(widget.videoId);
      if (offline != null) {
        final file = File(offline.localPath);
        if (await file.exists()) {
          sourceUrl = offline.localPath;
        }
      }

      if (sourceUrl.isEmpty) {
        throw Exception('This video file is not available yet.');
      }

      if (!sourceUrl.startsWith('http://') && !sourceUrl.startsWith('https://')) {
        // Offline file — skip embeddable check.
      } else if (!VideoPlayback.isEmbeddableStream(sourceUrl)) {
        throw Exception(
          'This video uses an external link that cannot be played in the app.',
        );
      }

      _streamLabel = sourceUrl == playbackUrl
          ? VideoPlayback.streamQualityLabel(playbackUrl)
          : 'Offline';

      final controller = await _openPlaybackController(
        sourceUrl,
        mp4Fallback: VideoPlayback.resolveUrl(playback.videoUrl),
      );

      await VideoPlaybackSession.instance.claim(this, controller);
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
          placeholder: _buildPosterPlaceholder(),
        );
        _loading = false;
      });

      _schedulePreloadNext();
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = VideoPlayback.friendlyError(error);
        _loading = false;
      });
    }
  }

  void _applyCourseContext(Course rawCourse, SubscriptionProvider subs) {
    final subscriptionActive = subs.hasAccess(rawCourse.id);
    final course = CourseAccess.applyPlaybackLocks(
      rawCourse,
      subscriptionActive: subscriptionActive,
    );
    _course = course;
    _isPurchased = CourseAccess.isCoursePurchased(
      rawCourse,
      subscriptionActive: subscriptionActive,
    );
    _nextEntry = nextPlayableVideo(course, widget.videoId);
    _previousEntry = previousPlayableVideo(course, widget.videoId);

    for (final lesson in course.lessons) {
      for (final video in lesson.videos) {
        if (video.id == widget.videoId) {
          _title = video.title;
          _lessonTitle = lesson.title;
          _videoDuration = video.duration;
          _posterUrl = course.thumbnail ?? video.thumbnail;
          break;
        }
      }
    }
  }

  Future<void> _refreshCourseInBackground(SubscriptionProvider subs) async {
    try {
      final fresh = await widget.courseService.getCourseFull(widget.courseId);
      if (!mounted) return;
      _applyCourseContext(fresh, subs);
      setState(() {});
    } catch (_) {
      // Keep showing cached playlist if refresh fails.
    }
  }

  Widget _buildPosterPlaceholder() {
    final poster = _posterUrl;
    if (poster == null || poster.isEmpty) {
      return const ColoredBox(color: Colors.black);
    }
    return Stack(
      fit: StackFit.expand,
      children: [
        ThumbnailImage(url: poster, borderRadius: 0, fit: BoxFit.cover),
        const ColoredBox(color: Color(0x66000000)),
      ],
    );
  }

  Future<VideoPlayerController> _openPlaybackController(
    String sourceUrl, {
    required String mp4Fallback,
  }) async {
    try {
      return await _createPlayerController(sourceUrl);
    } catch (primaryError) {
      final canFallback = VideoPlayback.isHlsManifest(sourceUrl) &&
          mp4Fallback.isNotEmpty &&
          !VideoPlayback.isHlsManifest(mp4Fallback) &&
          sourceUrl != mp4Fallback;
      if (!canFallback) rethrow;
      return _createPlayerController(mp4Fallback);
    }
  }

  Future<VideoPlayerController> _createPlayerController(String url) async {
    final isNetwork =
        url.startsWith('http://') || url.startsWith('https://');
    final isHls = isNetwork && VideoPlayback.isHlsManifest(url);
    final timeout = isHls
        ? const Duration(seconds: 60)
        : const Duration(seconds: 30);

    final options = VideoPlayerOptions(
      mixWithOthers: false,
      allowBackgroundPlayback: false,
    );

    final controller = isNetwork
        ? VideoPlayerController.networkUrl(
            Uri.parse(url),
            videoPlayerOptions: options,
          )
        : VideoPlayerController.file(
            File(url),
            videoPlayerOptions: options,
          );

    await controller.initialize().timeout(
      timeout,
      onTimeout: () => throw Exception(
        'Video is taking too long to load. Check your connection and try again.',
      ),
    );

    return controller;
  }

  void _schedulePreloadNext() {
    final next = _nextEntry;
    if (next == null || next.video.isLocked) return;

    widget.courseService.prefetchVideoPlayback(
      widget.courseId,
      next.video.id,
    );
  }

  Future<void> _disposePlayer() async {
    final controller = _videoController;
    _videoController?.removeListener(_onPlaybackUpdate);

    if (controller != null) {
      try {
        await controller.pause();
      } catch (_) {}
      await VideoPlaybackSession.instance.release(this, controller);
    }

    _chewieController?.dispose();
    _chewieController = null;
    _videoController = null;

    if (controller != null) {
      await controller.dispose();
    }
  }

  void _onPlaybackUpdate() {
    final controller = _videoController;
    final course = _course;
    if (controller == null ||
        course == null ||
        !controller.value.isInitialized) {
      return;
    }

    final buffering = controller.value.isBuffering;
    if (_isBuffering != buffering && mounted) {
      setState(() => _isBuffering = buffering);
    }

    final duration = controller.value.duration;
    final position = controller.value.position;
    if (duration.inMilliseconds <= 0) return;

    final remaining = duration - position;
    _updateAutoplayOverlay(remaining);

    if (_completionHandled) return;

    final nearEnd = remaining <= const Duration(seconds: 1);
    if (!nearEnd) return;

    _completionHandled = true;
    _cancelAutoplayOverlay();
    _handleVideoCompleted(course);
  }

  void _updateAutoplayOverlay(Duration remaining) {
    final next = _nextEntry;
    if (next == null || _autoplayCancelled || _locked) {
      if (_showAutoplayOverlay) _cancelAutoplayOverlay();
      return;
    }

    if (remaining > _autoplayLeadTime) {
      if (_showAutoplayOverlay) _cancelAutoplayOverlay();
      return;
    }

    final secondsLeft = remaining.inSeconds.clamp(0, _autoplayLeadTime.inSeconds);
    if (!_showAutoplayOverlay) {
      setState(() {
        _showAutoplayOverlay = true;
        _autoplaySecondsLeft = secondsLeft > 0 ? secondsLeft : 1;
      });
      _startOverlayTicker();
      return;
    }

    if (_autoplaySecondsLeft != secondsLeft && mounted) {
      setState(() => _autoplaySecondsLeft = secondsLeft);
    }
  }

  void _startOverlayTicker() {
    _overlayTimer?.cancel();
    _overlayTimer = Timer.periodic(const Duration(milliseconds: 500), (_) {
      final controller = _videoController;
      if (!mounted || controller == null || !controller.value.isInitialized) {
        return;
      }
      final remaining = controller.value.duration - controller.value.position;
      if (remaining <= Duration.zero) {
        _overlayTimer?.cancel();
      }
      _updateAutoplayOverlay(remaining);
    });
  }

  void _cancelAutoplayOverlay() {
    _overlayTimer?.cancel();
    _overlayTimer = null;
    if (_showAutoplayOverlay && mounted) {
      setState(() {
        _showAutoplayOverlay = false;
        _autoplaySecondsLeft = _autoplayLeadTime.inSeconds;
      });
    }
  }

  void _cancelAutoplay() {
    _autoplayCancelled = true;
    _cancelAutoplayOverlay();
  }

  Future<void> _handleVideoCompleted(Course course) async {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated || auth.user == null) return;

    final progress = context.read<LearningProgressProvider>();
    await progress.markVideoWatched(
      userId: auth.user!.id,
      course: course,
      lessonId: widget.lessonId,
      videoId: widget.videoId,
      isPurchased: _isPurchased,
    );

    if (!mounted) return;

    await syncUserNotifications(context);

    if (!mounted) return;

    final next = _nextEntry;
    if (next != null && mounted) {
      _playVideo(next);
    }
  }

  void _playPrevious() {
    final previous = _previousEntry;
    if (previous != null) _playVideo(previous);
  }

  void _playNext() {
    final next = _nextEntry;
    if (next != null) _playVideo(next);
  }

  void _playVideo(CourseVideoEntry entry) {
    if (entry.video.id == widget.videoId) return;
    _cancelAutoplayOverlay();
    unawaited(_pausePlayback());
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

  void _openCheckout() {
    if (_course == null) return;
    context.push('/courses/${_course!.id}/checkout');
  }

  @override
  void deactivate() {
    _stopPlayback();
    super.deactivate();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _stopPlayback();
    unawaited(_disposePlayer());
    super.dispose();
  }

  Widget _buildPlayerArea() {
    final playlist = _course == null
        ? const <CourseVideoEntry>[]
        : courseVideoPlaylist(_course!);
    final position = _course == null
        ? 1
        : playlistIndex(_course!, widget.videoId) + 1;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Stack(
          children: [
            _buildPlayerSlot(),
            if (_showAutoplayOverlay && _nextEntry != null)
              VideoNextOverlay(
                next: _nextEntry!,
                secondsLeft: _autoplaySecondsLeft,
                onCancel: _cancelAutoplay,
                onPlayNow: () => _playVideo(_nextEntry!),
                courseThumbnail: _course?.thumbnail,
              ),
          ],
        ),
        if (!_locked && _course != null)
          VideoTransportBar(
            videoTitle: _title,
            playlistPosition: position > 0 ? position : 1,
            playlistTotal: playlist.length,
            previous: _previousEntry,
            next: _nextEntry,
            onPrevious: _playPrevious,
            onNext: _playNext,
          ),
      ],
    );
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
      return AspectRatio(
        aspectRatio: 16 / 9,
        child: Stack(
          fit: StackFit.expand,
          children: [
            _buildPosterPlaceholder(),
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const CircularProgressIndicator(
                    color: AppColors.primary,
                    strokeWidth: 2.5,
                  ),
                  if (_streamLabel != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      _streamLabel!,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      );
    }

    return AspectRatio(
      aspectRatio: _videoController!.value.aspectRatio == 0
          ? 16 / 9
          : _videoController!.value.aspectRatio,
      child: Stack(
        fit: StackFit.expand,
        children: [
          Chewie(controller: _chewieController!),
          if (_isBuffering)
            const ColoredBox(
              color: Color(0x33000000),
              child: Center(
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2.5,
                ),
              ),
            ),
          if (_streamLabel != null)
            Positioned(
              left: 12,
              bottom: 12,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.55),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  child: Text(
                    _streamLabel!,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildContentSheet({required Set<String> watchedIds}) {
    final c = context.colors;
    final course = _course!;

    return Container(
      decoration: BoxDecoration(
        color: c.background,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
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
                color: c.border,
                borderRadius: BorderRadius.circular(99),
              ),
            ),
          ),
          VideoPlayerInfoPanel(
            videoTitle: _title,
            lessonTitle: _lessonTitle.isEmpty ? 'Lesson' : _lessonTitle,
            videoDurationSeconds: _videoDuration,
            isWatched: watchedIds.contains(widget.videoId),
          ),
          VideoActionBar(
            videoId: widget.videoId,
            courseId: widget.courseId,
            videoTitle: _title,
            playbackUrl: _downloadUrl,
            lessonId: widget.lessonId,
            courseTitle: _course?.title,
            isLocked: _locked,
          ),
          Divider(height: 1, color: c.border),
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
      appBar: PageAppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
        onBack: () {
          _stopPlayback();
          navigateBack(context);
        },
        title: Text(
          _course?.title ?? 'Course',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
      body: _error != null
          ? ColoredBox(
              color: context.colors.background,
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
                    _buildPlayerArea(),
                    Expanded(
                      child: _buildContentSheet(watchedIds: watchedIds),
                    ),
                  ],
                ),
    );
  }
}

