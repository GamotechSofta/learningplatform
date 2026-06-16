import 'package:flutter/material.dart';

import '../core/theme/themed_colors.dart';
import '../core/utils/course_rating.dart';
import '../models/course.dart';

enum CourseRatingStyle { compact, full }

/// Star rating display derived from [Course.rating] (4.0 – 5.0, fixed per course).
class CourseRatingStars extends StatelessWidget {
  const CourseRatingStars({
    super.key,
    required this.course,
    this.style = CourseRatingStyle.compact,
    this.showReviewCount = true,
    this.starSize = 13,
  });

  final Course course;
  final CourseRatingStyle style;
  final bool showReviewCount;
  final double starSize;

  static const _starColor = Color(0xFFF59E0B);

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final rating = course.rating;
    final reviews = course.reviewCount;

    if (style == CourseRatingStyle.compact) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.star_rounded, size: starSize, color: _starColor),
          const SizedBox(width: 3),
          Text(
            rating.toStringAsFixed(1),
            style: TextStyle(
              fontSize: starSize - 1,
              fontWeight: FontWeight.w800,
              color: c.textPrimary,
              height: 1,
            ),
          ),
          if (showReviewCount) ...[
            const SizedBox(width: 4),
            Text(
              '(${CourseRating.formatCount(reviews)})',
              style: TextStyle(
                fontSize: starSize - 2,
                fontWeight: FontWeight.w500,
                color: c.textSecondary,
                height: 1,
              ),
            ),
          ],
        ],
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(5, (index) {
          final starIndex = index + 1;
          final IconData icon;
          if (rating >= starIndex) {
            icon = Icons.star_rounded;
          } else if (rating >= starIndex - 0.5) {
            icon = Icons.star_half_rounded;
          } else {
            icon = Icons.star_outline_rounded;
          }
          return Padding(
            padding: EdgeInsets.only(right: index == 4 ? 6 : 1),
            child: Icon(icon, size: starSize, color: _starColor),
          );
        }),
        Text(
          rating.toStringAsFixed(1),
          style: TextStyle(
            fontSize: starSize,
            fontWeight: FontWeight.w800,
            color: c.textPrimary,
          ),
        ),
        if (showReviewCount) ...[
          const SizedBox(width: 6),
          Text(
            '${CourseRating.formatCount(reviews)} reviews',
            style: TextStyle(
              fontSize: starSize - 1,
              fontWeight: FontWeight.w500,
              color: c.textSecondary,
            ),
          ),
        ],
      ],
    );
  }
}
