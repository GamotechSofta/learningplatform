import 'package:flutter/material.dart';

import '../services/category_service.dart';
import 'search_screen.dart';

class SearchPage extends StatelessWidget {
  const SearchPage({super.key, required this.categoryService});

  final CategoryService categoryService;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Search'),
        backgroundColor: const Color(0xFFF8FAFC),
      ),
      body: SearchScreen(categoryService: categoryService),
    );
  }
}
