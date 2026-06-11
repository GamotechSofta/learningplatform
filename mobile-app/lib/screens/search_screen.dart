import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../models/category.dart';
import '../services/category_service.dart';
import '../widgets/course_card.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_view.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key, required this.categoryService});

  final CategoryService categoryService;

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _controller = TextEditingController();
  Future<List<Category>>? _future;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _search(String query) {
    setState(() {
      _future = widget.categoryService.search(query);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
          child: TextField(
            controller: _controller,
            decoration: InputDecoration(
              hintText: 'Search courses or categories',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: IconButton(
                icon: const Icon(Icons.clear),
                onPressed: () {
                  _controller.clear();
                  setState(() => _future = null);
                },
              ),
            ),
            onSubmitted: _search,
          ),
        ),
        Expanded(
          child: _future == null
              ? const EmptyState(
                  title: 'Search for courses',
                  subtitle: 'Find content uploaded from the admin panel.',
                  icon: Icons.search,
                )
              : FutureBuilder<List<Category>>(
                  future: _future,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }

                    if (snapshot.hasError) {
                      return ErrorView(
                        message: snapshot.error.toString(),
                        onRetry: () => _search(_controller.text),
                      );
                    }

                    final categories = snapshot.data ?? [];
                    final courses = categories
                        .expand((c) => c.courses)
                        .where((c) => c.isPublished)
                        .toList();

                    if (courses.isEmpty) {
                      return const EmptyState(
                        title: 'No results found',
                        subtitle: 'Try a different search term.',
                      );
                    }

                    return ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                      itemCount: courses.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 14),
                      itemBuilder: (context, index) {
                        final course = courses[index];
                        return CourseCard(
                          course: course,
                          onTap: () => context.push('/courses/${course.id}'),
                        );
                      },
                    );
                  },
                ),
        ),
      ],
    );
  }
}
