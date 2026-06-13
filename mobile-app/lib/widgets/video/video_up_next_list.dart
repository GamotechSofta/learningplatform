import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../models/course.dart';
import '../../models/video.dart';
import '../thumbnail_image.dart';

class CourseVideoEntry {
  const CourseVideoEntry({
    required this.lessonId,
    required this.lessonTitle,
    required this.video,
  });

  final String lessonId;
  final String lessonTitle;
  final VideoItem video;
}

List<CourseVideoEntry> courseVideoPlaylist(Course course) {
  final items = <CourseVideoEntry>[];
  for (final lesson in course.lessons) {
    for (final video in lesson.videos) {
      items.add(
        CourseVideoEntry(
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          video: video,
        ),
      );
    }
  }
  return items;
}

class VideoUpNextList extends StatelessWidget {
  const VideoUpNextList({
    super.key,
    required this.course,
    required this.currentVideoId,
    required this.watchedVideoIds,
    required this.onVideoSelected,
  });

  final Course course;
  final String currentVideoId;
  final Set<String> watchedVideoIds;
  final void Function(CourseVideoEntry entry) onVideoSelected;

  @override
  Widget build(BuildContext context) {
    final playlist = courseVideoPlaylist(course);
    if (playlist.isEmpty) return const SizedBox.shrink();

    final currentIndex = playlist.indexWhere((e) => e.video.id == currentVideoId);
    final upNext = currentIndex < 0
        ? playlist
        : playlist.sublist(currentIndex + 1);

    if (upNext.isEmpty) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
          ),
          child: const Row(
            children: [
              Icon(Icons.emoji_events_outlined, color: AppColors.primary),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Last video in this course. Great job finishing the playlist!',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                    height: 1.35,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(20, 4, 20, 12),
          child: Text(
            'Up next',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        ...upNext.map(
          (entry) => _UpNextTile(
            entry: entry,
            index: playlist.indexOf(entry) + 1,
            isWatched: watchedVideoIds.contains(entry.video.id),
            onTap: () => onVideoSelected(entry),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

class _UpNextTile extends StatelessWidget {
  const _UpNextTile({
    required this.entry,
    required this.index,
    required this.isWatched,
    required this.onTap,
  });

  final CourseVideoEntry entry;
  final int index;
  final bool isWatched;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final locked = entry.video.isLocked;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 4),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$index',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(width: 10),
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Stack(
                    children: [
                      ThumbnailImage(
                        url: locked ? null : entry.video.thumbnail,
                        videoUrl: locked ? null : entry.video.frameSourceUrl,
                        width: 128,
                        height: 72,
                        borderRadius: 0,
                        fit: BoxFit.cover,
                        blurPreview: locked,
                        showMediaOverlay: !locked,
                        icon: Icons.lock_rounded,
                        mediaOverlayIcon: Icons.play_circle_outline,
                      ),
                      if (entry.video.duration > 0)
                        Positioned(
                          right: 5,
                          bottom: 5,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 5,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.8),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              _formatDuration(entry.video.duration),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        entry.video.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: locked
                              ? AppColors.textSecondary
                              : AppColors.textPrimary,
                          height: 1.3,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        entry.lessonTitle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      if (locked || isWatched) ...[
                        const SizedBox(height: 6),
                        if (locked)
                          const _Tag(label: 'Locked', icon: Icons.lock_outline)
                        else
                          const _Tag(
                            label: 'Watched',
                            icon: Icons.check_circle_outline,
                            color: AppColors.primary,
                          ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag({
    required this.label,
    required this.icon,
    this.color = AppColors.textSecondary,
  });

  final String label;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: color),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: color,
          ),
        ),
      ],
    );
  }
}

String _formatDuration(int seconds) {
  if (seconds <= 0) return '';
  final hours = seconds ~/ 3600;
  final minutes = (seconds % 3600) ~/ 60;
  final remaining = seconds % 60;
  if (hours > 0) {
    return '$hours:${minutes.toString().padLeft(2, '0')}:${remaining.toString().padLeft(2, '0')}';
  }
  return '$minutes:${remaining.toString().padLeft(2, '0')}';
}
