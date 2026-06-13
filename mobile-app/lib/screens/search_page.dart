import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';
import '../services/category_service.dart';
import 'search_screen.dart';

class SearchPage extends StatelessWidget {
  const SearchPage({super.key, required this.categoryService});

  final CategoryService categoryService;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Search'),
        backgroundColor: AppColors.background,
      ),
      body: SearchScreen(categoryService: categoryService),
    );
  }
}
