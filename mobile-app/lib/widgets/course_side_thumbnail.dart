import 'package:flutter/material.dart';

import '../core/utils/course_list_utils.dart';
import '../models/course.dart';
import 'course_placeholder_thumbnail.dart';
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
    if (!CourseListUtils.hasPreviewMedia(course)) {
      return CoursePlaceholderThumbnail(
        course: course,
        width: width,
        height: height,
      );
    }

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
        showMediaOverlay: CourseListUtils.hasPreviewMedia(course),
        icon: Icons.play_circle_outline,
      ),
    );
  }
}
