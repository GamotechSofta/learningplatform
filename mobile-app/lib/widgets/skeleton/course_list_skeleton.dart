import 'package:flutter/material.dart';

import 'skeleton_box.dart';

class CourseListSkeleton extends StatelessWidget {
  const CourseListSkeleton({super.key, this.count = 5});

  final int count;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      itemCount: count,
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemBuilder: (_, __) => const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SkeletonBox(
            width: double.infinity,
            height: 180,
            borderRadius: 16,
          ),
          SizedBox(height: 12),
          SkeletonBox(width: 120, height: 12, borderRadius: 8),
          SizedBox(height: 8),
          SkeletonBox(width: double.infinity, height: 16, borderRadius: 8),
          SizedBox(height: 8),
          SkeletonBox(width: 90, height: 12, borderRadius: 8),
        ],
      ),
    );
  }
}
