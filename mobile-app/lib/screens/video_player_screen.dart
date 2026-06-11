import 'package:chewie/chewie.dart';
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

import '../services/course_service.dart';
import '../widgets/error_view.dart';

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

  @override
  void initState() {
    super.initState();
    _loadVideo();
  }

  Future<void> _loadVideo() async {
    try {
      final course = await widget.courseService.getCourseFull(widget.courseId);
      final lesson = course.lessons.firstWhere((l) => l.id == widget.lessonId);
      final video = lesson.videos.firstWhere((v) => v.id == widget.videoId);

      if (video.videoUrl.isEmpty) {
        throw Exception('Video URL is not available');
      }

      _title = video.title;

      final controller = VideoPlayerController.networkUrl(Uri.parse(video.videoUrl));
      await controller.initialize();

      if (!mounted) return;

      setState(() {
        _videoController = controller;
        _chewieController = ChewieController(
          videoPlayerController: controller,
          autoPlay: true,
          aspectRatio: controller.value.aspectRatio == 0 ? 16 / 9 : controller.value.aspectRatio,
          materialProgressColors: ChewieProgressColors(
            playedColor: Theme.of(context).colorScheme.primary,
            handleColor: Theme.of(context).colorScheme.primary,
            bufferedColor: const Color(0xFFCBD5E1),
            backgroundColor: const Color(0xFFE2E8F0),
          ),
        );
      });
    } catch (error) {
      if (!mounted) return;
      setState(() => _error = error.toString());
    }
  }

  @override
  void dispose() {
    _chewieController?.dispose();
    _videoController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_title, maxLines: 1, overflow: TextOverflow.ellipsis)),
      body: _error != null
          ? ErrorView(message: _error!, onRetry: _loadVideo)
          : _chewieController == null
              ? const Center(child: CircularProgressIndicator())
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AspectRatio(
                      aspectRatio: _videoController!.value.aspectRatio == 0
                          ? 16 / 9
                          : _videoController!.value.aspectRatio,
                      child: Chewie(controller: _chewieController!),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text(
                        _title,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                    ),
                  ],
                ),
    );
  }
}
