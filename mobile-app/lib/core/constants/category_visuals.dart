import 'package:flutter/material.dart';

import '../../models/category.dart';

class CategoryVisual {
  const CategoryVisual({
    required this.icon,
    required this.color,
    required this.background,
  });

  final IconData icon;
  final Color color;
  final Color background;
}

CategoryVisual categoryVisual(Category category) {
  final key = '${category.slug} ${category.name}'.toLowerCase();

  if (key.contains('jee') || key.contains('exam') || key.contains('competitive')) {
    return const CategoryVisual(
      icon: Icons.track_changes_rounded,
      color: Color(0xFF16A34A),
      background: Color(0xFFDCFCE7),
    );
  }
  if (key.contains('it') || key.contains('machine') || key.contains('network')) {
    return const CategoryVisual(
      icon: Icons.computer_rounded,
      color: Color(0xFF2563EB),
      background: Color(0xFFDBEAFE),
    );
  }
  if (key.contains('school') || key.contains('student')) {
    return const CategoryVisual(
      icon: Icons.backpack_rounded,
      color: Color(0xFF2563EB),
      background: Color(0xFFDBEAFE),
    );
  }
  if (key.contains('college') || key.contains('youth')) {
    return const CategoryVisual(
      icon: Icons.school_rounded,
      color: Color(0xFF7C3AED),
      background: Color(0xFFEDE9FE),
    );
  }
  if (key.contains('entrepreneur') || key.contains('business')) {
    return const CategoryVisual(
      icon: Icons.rocket_launch_rounded,
      color: Color(0xFFEA580C),
      background: Color(0xFFFFEDD5),
    );
  }
  if (key.contains('marketing') || key.contains('seo')) {
    return const CategoryVisual(
      icon: Icons.campaign_rounded,
      color: Color(0xFFDB2777),
      background: Color(0xFFFCE7F3),
    );
  }

  return const CategoryVisual(
    icon: Icons.menu_book_rounded,
    color: Color(0xFF2563EB),
    background: Color(0xFFEFF6FF),
  );
}
