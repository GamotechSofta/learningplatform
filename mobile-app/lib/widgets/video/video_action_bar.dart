import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/themed_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/video_engagement_provider.dart';

class VideoActionBar extends StatelessWidget {
  const VideoActionBar({
    super.key,
    required this.videoId,
    required this.courseId,
    required this.videoTitle,
    required this.playbackUrl,
    this.lessonId,
    this.courseTitle,
    this.isLocked = false,
  });

  final String videoId;
  final String courseId;
  final String videoTitle;
  final String playbackUrl;
  final String? lessonId;
  final String? courseTitle;
  final bool isLocked;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final auth = context.watch<AuthProvider>();
    final engagement = context.watch<VideoEngagementProvider>();

    final liked = engagement.isLiked(videoId);
    final disliked = engagement.isDisliked(videoId);
    final downloaded = engagement.isDownloaded(videoId);
    final downloading = engagement.isDownloading(videoId);
    final progress = engagement.downloadProgressFor(videoId);

    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: _VideoActionButton(
                  icon: liked ? Icons.thumb_up : Icons.thumb_up_outlined,
                  label: 'Like',
                  active: liked,
                  onTap: auth.isAuthenticated
                      ? () => _toggleLike(context)
                      : () => _requireLogin(context),
                ),
              ),
              Expanded(
                child: _VideoActionButton(
                  icon: disliked ? Icons.thumb_down : Icons.thumb_down_outlined,
                  label: 'Dislike',
                  active: disliked,
                  onTap: auth.isAuthenticated
                      ? () => _toggleDislike(context)
                      : () => _requireLogin(context),
                ),
              ),
              Expanded(
                child: _VideoActionButton(
                  icon: downloaded
                      ? Icons.download_done_rounded
                      : Icons.download_rounded,
                  label: downloaded ? 'Saved' : 'Download',
                  active: downloaded,
                  loading: downloading,
                  onTap: isLocked
                      ? null
                      : downloaded
                          ? () => _showDownloadedSnack(context)
                          : auth.isAuthenticated
                              ? () => _download(context)
                              : () => _requireLogin(context),
                ),
              ),
            ],
          ),
          if (downloading && progress != null) ...[
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(99),
              child: LinearProgressIndicator(
                value: progress.clamp(0.0, 1.0),
                minHeight: 4,
                backgroundColor: c.border,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Downloading… ${(progress * 100).round()}%',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 11, color: c.textSecondary),
            ),
          ],
        ],
      ),
    );
  }

  void _requireLogin(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Sign in to use this feature')),
    );
  }

  Future<void> _toggleLike(BuildContext context) async {
    final auth = context.read<AuthProvider>();
    final engagement = context.read<VideoEngagementProvider>();
    if (auth.user == null) return;
    await engagement.toggleLike(auth.user!.id, videoId);
  }

  Future<void> _toggleDislike(BuildContext context) async {
    final auth = context.read<AuthProvider>();
    final engagement = context.read<VideoEngagementProvider>();
    if (auth.user == null) return;
    await engagement.toggleDislike(auth.user!.id, videoId);
  }

  Future<void> _download(BuildContext context) async {
    if (playbackUrl.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('This video cannot be downloaded yet.')),
      );
      return;
    }

    final auth = context.read<AuthProvider>();
    final engagement = context.read<VideoEngagementProvider>();
    if (auth.user == null) return;

    try {
      await engagement.downloadVideo(
        userId: auth.user!.id,
        courseId: courseId,
        videoId: videoId,
        title: videoTitle,
        playbackUrl: playbackUrl,
        lessonId: lessonId,
        courseTitle: courseTitle,
      );
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Video saved for offline viewing in the app'),
        ),
      );
    } catch (error) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  void _showDownloadedSnack(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Already downloaded — plays from app storage'),
      ),
    );
  }
}

class _VideoActionButton extends StatelessWidget {
  const _VideoActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
    this.active = false,
    this.loading = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool active;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final color = active ? AppColors.primary : c.textPrimary;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: loading ? null : onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (loading)
                SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppColors.primary,
                  ),
                )
              else
                Icon(icon, size: 22, color: onTap == null ? c.textSecondary : color),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: onTap == null ? c.textSecondary : color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
