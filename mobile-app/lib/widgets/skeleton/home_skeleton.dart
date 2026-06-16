import 'package:flutter/material.dart';

import '../home/recommended_course_card.dart';
import 'skeleton_box.dart';
class HomeSkeleton extends StatelessWidget {
  const HomeSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 8),
          const SkeletonBox(width: double.infinity, height: 110, borderRadius: 16),
          const SizedBox(height: 24),
          const SkeletonBox(width: 140, height: 18),
          const SizedBox(height: 14),
          SizedBox(
            height: 110,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: 4,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (_, __) => const SkeletonBox(width: 88, height: 110, borderRadius: 16),
            ),
          ),
          const SizedBox(height: 24),
          const SkeletonBox(width: 180, height: 18),
          const SizedBox(height: 14),
          SizedBox(
            height: RecommendedCourseCard.cardHeight,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
              itemCount: 3,
              separatorBuilder: (_, __) => const SizedBox(width: 14),
              itemBuilder: (_, __) => const SkeletonBox(
                width: RecommendedCourseCard.cardWidth,
                height: RecommendedCourseCard.cardHeight,
                borderRadius: 16,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
