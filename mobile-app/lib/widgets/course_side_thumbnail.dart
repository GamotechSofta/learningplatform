import 'package:flutter/material.dart';

import '../models/course.dart';
import 'thumbnail_image.dart';

/// Left-side course preview used on course lists (Courses tab, My Learning).
class CourseSideThumbnail extends StatelessWidget {
  const CourseSideThumbnail({
    super.key,
    required this.course,
    this.width = 120,
    this.height = 90,
  });

  final Course course;
  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      height: height,
      child: ThumbnailImage(
        url: course.thumbnail,
        videoUrl: course.previewVideoUrl,
        width: width,
        height: height,
        borderRadius: 0,
        fit: BoxFit.cover,
        showMediaOverlay: true,
        icon: Icons.play_circle_outline,
      ),
    );
  }
}
