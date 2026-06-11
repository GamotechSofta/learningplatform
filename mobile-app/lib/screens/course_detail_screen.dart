import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../models/course.dart';
import '../models/lesson.dart';
import '../services/course_service.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_view.dart';
import '../widgets/thumbnail_image.dart';

class CourseDetailScreen extends StatefulWidget {
  const CourseDetailScreen({
    super.key,
    required this.courseId,
    required this.courseService,
  });

  final String courseId;
  final CourseService courseService;

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  late Future<Course> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.courseService.getCourseFull(widget.courseId);
  }

  void _reload() {
    setState(() {
      _future = widget.courseService.getCourseFull(widget.courseId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Course')),
      body: FutureBuilder<Course>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return ErrorView(
              message: snapshot.error.toString(),
              onRetry: _reload,
            );
          }

          final course = snapshot.data!;
          final lessons = course.lessons.where((l) => l.isPublished).toList();

          return RefreshIndicator(
            onRefresh: () async => _reload(),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              children: [
                ThumbnailImage(url: course.thumbnail),
                const SizedBox(height: 16),
                Text(
                  course.title,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  course.description,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: const Color(0xFF64748B),
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
                  ],
                ),
                const SizedBox(height: 24),
                Text(
                  'Lessons',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
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
                      onVideoTap: (videoId) => context.push(
                        '/courses/${course.id}/lessons/${lesson.id}/videos/$videoId',
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _LessonSection extends StatelessWidget {
  const _LessonSection({
    required this.lesson,
    required this.onVideoTap,
  });

  final Lesson lesson;
  final void Function(String videoId) onVideoTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    lesson.title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                ),
                if (lesson.isFree)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDCFCE7),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Text(
                      'FREE',
                      style: TextStyle(
                        color: Color(0xFF166534),
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
              ],
            ),
            if (lesson.description != null && lesson.description!.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                lesson.description!,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: const Color(0xFF64748B),
                    ),
              ),
            ],
            const SizedBox(height: 12),
            if (lesson.videos.isEmpty)
              Text(
                'No published videos',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: const Color(0xFF94A3B8),
                    ),
              )
            else
              ...lesson.videos.map(
                (video) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: CircleAvatar(
                    backgroundColor: const Color(0xFFEFF6FF),
                    child: Icon(
                      Icons.play_arrow,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                  title: Text(video.title),
                  subtitle: video.duration > 0
                      ? Text(_formatDuration(video.duration))
                      : null,
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => onVideoTap(video.id),
                ),
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

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }
}
