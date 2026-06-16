import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/course_playlist.dart';
import '../thumbnail_image.dart';

/// YouTube-style end card shown during the last few seconds of a video.
class VideoNextOverlay extends StatelessWidget {
  const VideoNextOverlay({
    super.key,
    required this.next,
    required this.secondsLeft,
    required this.onCancel,
    required this.onPlayNow,
    this.courseThumbnail,
  });

  final CourseVideoEntry next;
  final int secondsLeft;
  final VoidCallback onCancel;
  final VoidCallback onPlayNow;
  final String? courseThumbnail;

  @override
  Widget build(BuildContext context) {
    final progress = secondsLeft <= 0 ? 0.0 : secondsLeft / 5.0;

    return Positioned.fill(
      child: Material(
        color: Colors.black.withValues(alpha: 0.82),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Up next',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 14),
                Expanded(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: ThumbnailImage(
                          url: courseThumbnail,
                          width: 140,
                          height: 79,
                          borderRadius: 0,
                          fit: BoxFit.cover,
                          showMediaOverlay: true,
                          mediaOverlayIcon: Icons.play_arrow_rounded,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              next.video.title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                height: 1.3,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              next.lessonTitle,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 13,
                              ),
                            ),
                            if (next.video.duration > 0) ...[
                              const SizedBox(height: 6),
                              Text(
                                formatVideoDuration(next.video.duration),
                                style: const TextStyle(
                                  color: Colors.white54,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Row(
                  children: [
                    TextButton(
                      onPressed: onCancel,
                      child: const Text(
                        'Cancel',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const Spacer(),
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 44,
                          height: 44,
                          child: CircularProgressIndicator(
                            value: progress,
                            strokeWidth: 3,
                            color: AppColors.primary,
                            backgroundColor: Colors.white24,
                          ),
                        ),
                        Text(
                          secondsLeft > 0 ? '$secondsLeft' : '',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 12),
                    FilledButton.icon(
                      onPressed: onPlayNow,
                      style: FilledButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.black,
                      ),
                      icon: const Icon(Icons.play_arrow_rounded, size: 20),
                      label: const Text('Play now'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
