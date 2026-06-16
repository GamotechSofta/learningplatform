import 'package:flutter/material.dart';

import 'skeleton_box.dart';

class CourseDetailSkeleton extends StatelessWidget {
  const CourseDetailSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      children: const [
        SkeletonBox(width: double.infinity, height: 200, borderRadius: 12),
        SizedBox(height: 16),
        SkeletonBox(width: double.infinity, height: 24, borderRadius: 8),
        SizedBox(height: 8),
        SkeletonBox(width: double.infinity, height: 14, borderRadius: 6),
        SizedBox(height: 6),
        SkeletonBox(width: 260, height: 14, borderRadius: 6),
        SizedBox(height: 16),
        Row(
          children: [
            SkeletonBox(width: 72, height: 28, borderRadius: 99),
            SizedBox(width: 8),
            SkeletonBox(width: 90, height: 28, borderRadius: 99),
            SizedBox(width: 8),
            SkeletonBox(width: 64, height: 28, borderRadius: 99),
          ],
        ),
        SizedBox(height: 24),
        SkeletonBox(width: 100, height: 20, borderRadius: 8),
        SizedBox(height: 12),
        SkeletonBox(width: double.infinity, height: 72, borderRadius: 12),
        SizedBox(height: 10),
        SkeletonBox(width: double.infinity, height: 72, borderRadius: 12),
        SizedBox(height: 10),
        SkeletonBox(width: double.infinity, height: 72, borderRadius: 12),
      ],
    );
  }
}
