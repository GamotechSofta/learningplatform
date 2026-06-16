import 'package:flutter/material.dart';

import '../core/theme/themed_colors.dart';
import '../services/category_service.dart';
import 'search_screen.dart';

class SearchPage extends StatelessWidget {
  const SearchPage({super.key, required this.categoryService});

  final CategoryService categoryService;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Scaffold(
      backgroundColor: c.background,
      appBar: AppBar(
        title: Text('Search'),
        backgroundColor: c.background,
      ),
      body: SearchScreen(categoryService: categoryService),
    );
  }
}
