import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/themed_colors.dart';

class VideoPlayerInfoPanel extends StatelessWidget {
  const VideoPlayerInfoPanel({
    super.key,
    required this.videoTitle,
    required this.lessonTitle,
    required this.videoDurationSeconds,
    this.isWatched = false,
  });

  final String videoTitle;
  final String lessonTitle;
  final int videoDurationSeconds;
  final bool isWatched;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            videoTitle,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: c.textPrimary,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _MetaChip(
                icon: Icons.menu_book_outlined,
                label: lessonTitle,
              ),
              if (videoDurationSeconds > 0)
                _MetaChip(
                  icon: Icons.schedule_rounded,
                  label: _formatDuration(videoDurationSeconds),
                ),
              if (isWatched)
                const _MetaChip(
                  icon: Icons.check_circle_rounded,
                  label: 'Watched',
                  highlight: true,
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({
    required this.icon,
    required this.label,
    this.highlight = false,
  });

  final IconData icon;
  final String label;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: highlight ? c.primaryTint : c.background,
        borderRadius: BorderRadius.circular(99),
        border: Border.all(
          color: highlight
              ? AppColors.primary.withValues(alpha: 0.25)
              : c.border,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: highlight ? AppColors.primary : c.textSecondary,
          ),
          SizedBox(width: 5),
          Flexible(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: highlight ? AppColors.primary : c.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

String _formatDuration(int seconds) {
  final hours = seconds ~/ 3600;
  final minutes = (seconds % 3600) ~/ 60;
  final remaining = seconds % 60;
  if (hours > 0) {
    return '$hours:${minutes.toString().padLeft(2, '0')}:${remaining.toString().padLeft(2, '0')}';
  }
  return '$minutes:${remaining.toString().padLeft(2, '0')}';
}
