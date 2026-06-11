import 'package:flutter/material.dart';

import '../../core/constants/category_visuals.dart';
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
              decoration: BoxDecoration(
                color: visual.background,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: visual.color.withValues(alpha: 0.15)),
              ),
              child: Icon(visual.icon, color: visual.color, size: 30),
            ),
            const SizedBox(height: 10),
            Text(
              category.name,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Color(0xFF334155),
                height: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
