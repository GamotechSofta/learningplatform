import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../models/category.dart';
import '../services/category_service.dart';
import '../widgets/course_card.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_view.dart';
import '../widgets/thumbnail_image.dart';

class CategoryDetailScreen extends StatefulWidget {
  const CategoryDetailScreen({
    super.key,
    required this.categoryId,
    required this.categoryService,
  });

  final String categoryId;
  final CategoryService categoryService;

  @override
  State<CategoryDetailScreen> createState() => _CategoryDetailScreenState();
}

class _CategoryDetailScreenState extends State<CategoryDetailScreen> {
  late Future<Category> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.categoryService.getCategoryFull(widget.categoryId);
  }

  void _reload() {
    setState(() {
      _future = widget.categoryService.getCategoryFull(widget.categoryId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Category')),
      body: FutureBuilder<Category>(
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

          final category = snapshot.data!;
          final courses = category.courses.where((c) => c.isPublished).toList();

          return RefreshIndicator(
            onRefresh: () async => _reload(),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              children: [
                ThumbnailImage(
                  url: category.thumbnail,
                  aspectRatio: 16 / 8,
                  icon: Icons.category_outlined,
                ),
                const SizedBox(height: 16),
                Text(
                  category.name,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                if (category.description != null && category.description!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    category.description!,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: const Color(0xFF64748B),
                        ),
                  ),
                ],
                const SizedBox(height: 20),
                Text(
                  'Courses',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 12),
                if (courses.isEmpty)
                  const EmptyState(
                    title: 'No published courses',
                    subtitle: 'Publish courses from the admin panel to show them here.',
                  )
                else
                  ...courses.map(
                    (course) => Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: CourseCard(
                        course: course,
                        onTap: () => context.push('/courses/${course.id}'),
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
