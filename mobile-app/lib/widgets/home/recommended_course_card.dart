import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../models/course.dart';
import '../save_course_button.dart';
import '../thumbnail_image.dart';

class RecommendedCourseCard extends StatelessWidget {
  const RecommendedCourseCard({
    super.key,
    required this.course,
    required this.onTap,
    this.rank,
  });

  final Course course;
  final VoidCallback onTap;
  final int? rank;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Ink(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border.withValues(alpha: 0.8)),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.08),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _HeroImage(course: course, rank: rank),
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        course.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                          height: 1.25,
                          letterSpacing: -0.2,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          _LevelChip(level: course.level),
                          if (course.videoCount > 0) ...[
                            const SizedBox(width: 8),
                            Icon(
                              Icons.play_circle_outline_rounded,
                              size: 15,
                              color: AppColors.textSecondary.withValues(alpha: 0.9),
                            ),
                            const SizedBox(width: 3),
                            Text(
                              '${course.videoCount} videos',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                          const Spacer(),
                          _PriceTag(course: course),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _HeroImage extends StatelessWidget {
  const _HeroImage({required this.course, this.rank});

  final Course course;
  final int? rank;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 148,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          ThumbnailImage(
            url: course.thumbnail,
            videoUrl: course.previewVideoUrl,
            height: 148,
            borderRadius: 0,
            showMediaOverlay: true,
            mediaOverlayIcon: Icons.play_arrow_rounded,
          ),
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.05),
                  Colors.black.withValues(alpha: 0.45),
                ],
                stops: const [0.55, 1.0],
              ),
            ),
          ),
          if (course.categoryName != null && course.categoryName!.isNotEmpty)
            Positioned(
              left: 12,
              top: 12,
              right: 52,
              child: Align(
                alignment: Alignment.centerLeft,
                child: _CategoryBadge(label: course.categoryName!),
              ),
            ),
          if (rank != null)
            Positioned(
              left: 12,
              bottom: 12,
              child: _RankBadge(rank: rank!),
            ),
          Positioned(
            top: 10,
            right: 10,
            child: SaveCourseButton(
              course: course,
              iconSize: 18,
            ),
          ),
          if (!course.pricing.isPaid)
            const Positioned(
              right: 12,
              bottom: 12,
              child: _FreeBadge(),
            ),
        ],
      ),
    );
  }
}

class _CategoryBadge extends StatelessWidget {
  const _CategoryBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.92),
        borderRadius: BorderRadius.circular(99),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Text(
        label,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: AppColors.primaryDark,
        ),
      ),
    );
  }
}

class _RankBadge extends StatelessWidget {
  const _RankBadge({required this.rank});

  final int rank;

  @override
  Widget build(BuildContext context) {
    final labels = ['Top pick', '#2 for you', '#3 for you'];
    final label = rank <= labels.length ? labels[rank - 1] : '#$rank for you';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(99),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (rank == 1) ...[
            const Icon(Icons.auto_awesome_rounded, size: 12, color: Colors.white),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class _FreeBadge extends StatelessWidget {
  const _FreeBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.accentGreen,
        borderRadius: BorderRadius.circular(99),
      ),
      child: const Text(
        'Free',
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: Colors.white,
        ),
      ),
    );
  }
}

class _LevelChip extends StatelessWidget {
  const _LevelChip({required this.level});

  final String level;

  @override
  Widget build(BuildContext context) {
    final label = switch (level.toLowerCase()) {
      'intermediate' => 'Intermediate',
      'advanced' => 'Advanced',
      _ => 'Beginner',
    };

    return Text(
      label,
      style: const TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: AppColors.textSecondary,
      ),
    );
  }
}

class _PriceTag extends StatelessWidget {
  const _PriceTag({required this.course});

  final Course course;

  @override
  Widget build(BuildContext context) {
    if (!course.pricing.isPaid) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.primaryLight,
        borderRadius: BorderRadius.circular(99),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.25)),
      ),
      child: Text(
        course.pricing.displayPrice,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: AppColors.primaryDark,
        ),
      ),
    );
  }
}
