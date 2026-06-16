import 'package:flutter/material.dart';

import '../../core/constants/category_visuals.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/themed_colors.dart';
import '../../models/category.dart';

class TopCategoryTile extends StatelessWidget {
  const TopCategoryTile({
    super.key,
    required this.category,
    required this.onTap,
  });

  final Category category;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final visual = categoryVisual(category);

    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 88,
        child: Column(
          children: [
            Container(
              width: 72,
              height: 72,
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(
                color: c.surface,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: c.border),
                boxShadow: [
                  BoxShadow(color: c.cardShadow,
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: visual.imageAsset != null
                  ? Padding(
                      padding: const EdgeInsets.all(6),
                      child: Image.asset(
                        visual.imageAsset!,
                        width: double.infinity,
                        height: double.infinity,
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) => Icon(
                          visual.icon,
                          color: AppColors.primary,
                          size: 32,
                        ),
                      ),
                    )
                  : Icon(visual.icon, color: AppColors.primary, size: 32),
            ),
            SizedBox(height: 10),
            Text(
              category.name,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: c.textPrimary,
                height: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
