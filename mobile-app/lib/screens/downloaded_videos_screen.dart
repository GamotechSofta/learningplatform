import 'dart:io';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
import '../core/utils/course_playlist.dart';
import '../providers/auth_provider.dart';
import '../providers/network_provider.dart';
import '../providers/video_engagement_provider.dart';
import '../services/course_service.dart';
import '../services/video_engagement_service.dart';
import '../widgets/empty_state.dart';
import '../widgets/page_app_bar.dart';

class DownloadedVideosScreen extends StatefulWidget {
  const DownloadedVideosScreen({super.key, required this.courseService});

  final CourseService courseService;

  @override
  State<DownloadedVideosScreen> createState() => _DownloadedVideosScreenState();
}

class _DownloadedVideosScreenState extends State<DownloadedVideosScreen> {
  bool _loading = true;
  final Map<String, String> _courseTitles = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _refresh());
  }

  Future<void> _refresh() async {
    final auth = context.read<AuthProvider>();
    final userId = auth.user?.id;
    if (userId == null || userId.isEmpty) {
      if (mounted) setState(() => _loading = false);
      return;
    }

    setState(() => _loading = true);
    try {
      final engagement = context.read<VideoEngagementProvider>();
      await engagement.refreshDownloads(userId);
      await _resolveCourseTitles(engagement.allDownloads);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resolveCourseTitles(List<VideoDownloadRecord> downloads) async {
    final network = context.read<NetworkProvider>();
    if (network.isOffline) return;

    final titles = <String, String>{};

    for (final record in downloads) {
      if (record.courseTitle != null && record.courseTitle!.isNotEmpty) {
        titles[record.courseId] = record.courseTitle!;
        continue;
      }
      if (_courseTitles.containsKey(record.courseId)) continue;

      try {
        final course = await widget.courseService.getCourseFull(record.courseId);
        titles[record.courseId] = course.title;
      } catch (_) {}
    }

    if (!mounted || titles.isEmpty) return;
    setState(() => _courseTitles.addAll(titles));
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final engagement = context.watch<VideoEngagementProvider>();
    final network = context.watch<NetworkProvider>();
    final downloads = engagement.allDownloads;

    return Scaffold(
      backgroundColor: c.background,
      appBar: PageAppBar(
        backgroundColor: c.background,
        title: const Text('Downloaded videos'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: _loading ? null : _refresh,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : downloads.isEmpty
              ? EmptyState(
                  icon: Icons.download_rounded,
                  title: 'No downloads yet',
                  subtitle: network.isOffline
                      ? 'Connect to the internet to download videos for offline viewing.'
                      : 'Download videos from the player to watch them offline inside the app.',
                  actionLabel: network.isOffline ? null : 'Browse courses',
                  onAction: network.isOffline ? null : () => context.go('/'),
                )
              : RefreshIndicator(
                  onRefresh: _refresh,
                  child: ListView.separated(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                    itemCount: downloads.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final record = downloads[index];
                      final courseTitle = record.courseTitle ??
                          _courseTitles[record.courseId] ??
                          'Course';
                      return _DownloadedVideoTile(
                        record: record,
                        courseTitle: courseTitle,
                        onPlay: () => _playDownload(context, record),
                        onDelete: () => _confirmDelete(context, record),
                      );
                    },
                  ),
                ),
    );
  }

  Future<void> _playDownload(
    BuildContext context,
    VideoDownloadRecord record,
  ) async {
    final network = context.read<NetworkProvider>();
    final file = File(record.localPath);
    if (!await file.exists() || await file.length() <= 0) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Downloaded file is missing. Refreshing list…'),
        ),
      );
      await _refresh();
      return;
    }

    var lessonId = record.lessonId;
    if (lessonId == null || lessonId.isEmpty) {
      if (!network.isOffline) {
        try {
          final course =
              await widget.courseService.getCourseFull(record.courseId);
          lessonId = findVideoInCourse(course, record.videoId)?.lessonId;
        } catch (_) {
          lessonId = null;
        }
      }
    }

    if (!context.mounted) return;
    if (lessonId == null || lessonId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Could not open this video. Re-download it when you are back online.',
          ),
        ),
      );
      return;
    }

    context.push(
      '/courses/${record.courseId}/lessons/$lessonId/videos/${record.videoId}',
    );
  }

  Future<void> _confirmDelete(
    BuildContext context,
    VideoDownloadRecord record,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove download?'),
        content: Text(
          'Delete "${record.title}" from app storage? You can download it again later.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;

    final auth = context.read<AuthProvider>();
    final userId = auth.user?.id;
    if (userId == null) return;

    await context.read<VideoEngagementProvider>().removeDownload(
          userId,
          record.videoId,
        );

    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Download removed')),
    );
  }
}

class _DownloadedVideoTile extends StatelessWidget {
  const _DownloadedVideoTile({
    required this.record,
    required this.courseTitle,
    required this.onPlay,
    required this.onDelete,
  });

  final VideoDownloadRecord record;
  final String courseTitle;
  final VoidCallback onPlay;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final dateLabel = DateFormat.yMMMd().format(record.downloadedAt);

    return Card(
      elevation: 0,
      color: c.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: c.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onPlay,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 72,
                height: 52,
                decoration: BoxDecoration(
                  color: c.primaryTint,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.play_arrow_rounded,
                  color: AppColors.primary,
                  size: 30,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      record.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: c.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      courseTitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 13,
                        color: c.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Icon(
                          Icons.offline_pin_rounded,
                          size: 14,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Saved $dateLabel',
                          style: TextStyle(fontSize: 12, color: c.textSecondary),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              IconButton(
                tooltip: 'Remove download',
                onPressed: onDelete,
                icon: Icon(Icons.delete_outline_rounded, color: c.textSecondary),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
