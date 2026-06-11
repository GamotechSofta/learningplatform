import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../models/course.dart';
import '../services/course_service.dart';
import '../widgets/course_card.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_view.dart';
import '../widgets/home/section_header.dart';

class CoursesScreen extends StatefulWidget {
  const CoursesScreen({super.key, required this.courseService});

  final CourseService courseService;

  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> {
  late Future<List<Course>> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.courseService.getPublishedCourses();
  }

  void _reload() {
    setState(() {
      _future = widget.courseService.getPublishedCourses();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => _reload(),
          child: FutureBuilder<List<Course>>(
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

              final courses = snapshot.data ?? [];

              return ListView(
                padding: const EdgeInsets.only(bottom: 24),
                children: [
                  const SizedBox(height: 12),
                  const SectionHeader(title: 'All Courses'),
                  const SizedBox(height: 8),
                  if (courses.isEmpty)
                    const SizedBox(
                      height: 300,
                      child: EmptyState(
                        title: 'No courses yet',
                        subtitle: 'Published courses from admin will appear here.',
                      ),
                    )
                  else
                    ...courses.map(
                      (course) => Padding(
                        padding: const EdgeInsets.fromLTRB(20, 0, 20, 14),
                        child: CourseCard(
                          course: course,
                          onTap: () => context.push('/courses/${course.id}'),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}
