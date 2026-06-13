import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../../models/category.dart';
import 'app_assets.dart';

class CategoryVisual {
  const CategoryVisual({
    required this.icon,
    required this.color,
    required this.background,
    this.imageAsset,
  });

  final IconData icon;
  final Color color;
  final Color background;
  final String? imageAsset;
}

CategoryVisual categoryVisual(Category category) {
  final slug = category.slug.toLowerCase();
  final name = category.name.toLowerCase();
  final key = '$slug $name';

  if (slug.contains('aws') || key.contains('devops')) {
    return const CategoryVisual(
      icon: Icons.cloud_outlined,
      color: Color(0xFFEA580C),
      background: Color(0xFFFFEDD5),
      imageAsset: AppAssets.awsDevopsCategory,
    );
  }
  if (slug.contains('cyber') || key.contains('security')) {
    return const CategoryVisual(
      icon: Icons.security_rounded,
      color: Color(0xFFDC2626),
      background: Color(0xFFFEE2E2),
      imageAsset: AppAssets.cybersecurityCategory,
    );
  }
  if (slug.contains('operating-system') || key.contains('operating system') || key.contains('(os)')) {
    return const CategoryVisual(
      icon: Icons.terminal_rounded,
      color: Color(0xFF0891B2),
      background: Color(0xFFCFFAFE),
      imageAsset: AppAssets.operatingSystemCategory,
    );
  }
  if (slug.contains('skill') || key.contains('skill cour')) {
    return const CategoryVisual(
      icon: Icons.handyman_rounded,
      color: Color(0xFF7C3AED),
      background: Color(0xFFEDE9FE),
      imageAsset: AppAssets.skillCoursesCategory,
    );
  }
  if (slug.contains('video-editing') || key.contains('video editing')) {
    return const CategoryVisual(
      icon: Icons.video_library_outlined,
      color: Color(0xFFDB2777),
      background: Color(0xFFFCE7F3),
      imageAsset: AppAssets.videoEditingCategory,
    );
  }
  if (slug.contains('jee') || key.contains('jee main')) {
    return const CategoryVisual(
      icon: Icons.track_changes_rounded,
      color: Color(0xFF16A34A),
      background: Color(0xFFDCFCE7),
      imageAsset: AppAssets.jeeMainCategory,
    );
  }
  if (slug.contains('vocational') || key.contains('vocational')) {
    return const CategoryVisual(
      icon: Icons.engineering_rounded,
      color: Color(0xFFCA8A04),
      background: Color(0xFFFEF9C3),
      imageAsset: AppAssets.vocationalTrainingCategory,
    );
  }
  if (slug.contains('it-course') || key.contains('it course')) {
    return const CategoryVisual(
      icon: Icons.computer_rounded,
      color: AppColors.primary,
      background: AppColors.primaryLight,
      imageAsset: AppAssets.itCoursesCategory,
    );
  }

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
      color: AppColors.primary,
      background: AppColors.primaryLight,
    );
  }
  if (key.contains('school') || key.contains('student')) {
    return const CategoryVisual(
      icon: Icons.backpack_rounded,
      color: AppColors.primary,
      background: AppColors.primaryLight,
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
    color: AppColors.primary,
    background: AppColors.primaryLight,
  );
}
