import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/course_playlist.dart';

/// Prev / next controls shown under the player (YouTube-style queue navigation).
class VideoTransportBar extends StatelessWidget {
  const VideoTransportBar({
    super.key,
    required this.videoTitle,
    required this.playlistPosition,
    required this.playlistTotal,
    this.previous,
    this.next,
    required this.onPrevious,
    required this.onNext,
  });

  final String videoTitle;
  final int playlistPosition;
  final int playlistTotal;
  final CourseVideoEntry? previous;
  final CourseVideoEntry? next;
  final VoidCallback? onPrevious;
  final VoidCallback? onNext;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF121212),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      child: Row(
        children: [
          IconButton(
            onPressed: previous != null ? onPrevious : null,
            icon: const Icon(Icons.skip_previous_rounded),
            color: Colors.white,
            disabledColor: Colors.white24,
            tooltip: 'Previous video',
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  videoTitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                if (playlistTotal > 0)
                  Text(
                    'Video $playlistPosition of $playlistTotal',
                    style: const TextStyle(
                      color: Colors.white54,
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
              ],
            ),
          ),
          if (next != null)
            TextButton.icon(
              onPressed: onNext,
              icon: const Icon(Icons.skip_next_rounded, size: 20),
              label: const Text('Next'),
              style: TextButton.styleFrom(
                foregroundColor: AppColors.primary,
              ),
            )
          else
            IconButton(
              onPressed: null,
              icon: const Icon(Icons.skip_next_rounded),
              color: Colors.white24,
              tooltip: 'No next video',
            ),
        ],
      ),
    );
  }
}
