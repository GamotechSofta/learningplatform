import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/theme/app_colors.dart';
import '../models/course.dart';
import 'thumbnail_image.dart';

class PurchaseDialog {
  PurchaseDialog._();

  static Future<void> show(BuildContext context, Course course) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(99),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: ThumbnailImage(
                    url: course.thumbnail,
                    videoUrl: course.previewVideoUrl,
                    borderRadius: 0,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Unlock this course',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Text(
                  'Only the first video is free as a demo. Purchase to unlock all ${course.videoCount} videos in this course.',
                  style: const TextStyle(color: AppColors.textSecondary, height: 1.5),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: () {
                      Navigator.of(sheetContext).pop();
                      context.push('/courses/${course.id}/checkout');
                    },
                    icon: const Icon(Icons.shopping_cart_checkout_rounded),
                    label: Text('Purchase • ${course.pricing.displayPrice}'),
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: TextButton(
                    onPressed: () => Navigator.of(sheetContext).pop(),
                    child: const Text('Not now'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
