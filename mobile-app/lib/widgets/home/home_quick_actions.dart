import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/themed_colors.dart';
import '../../navigation/main_shell_scope.dart';

class HomeQuickActions extends StatelessWidget {
  const HomeQuickActions({
    super.key,
    this.onBrowseCourses,
  });

  final VoidCallback? onBrowseCourses;

  @override
  Widget build(BuildContext context) {
    final shell = MainShellScope.of(context);

    final actions = [
      _QuickAction(
        icon: Icons.grid_view_rounded,
        label: 'Browse',
        color: AppColors.primary,
        onTap: onBrowseCourses ?? () => shell.selectTab(1),
      ),
      _QuickAction(
        icon: Icons.school_outlined,
        label: 'My Learning',
        color: const Color(0xFF0EA5E9),
        onTap: () => shell.selectTab(2),
      ),
      _QuickAction(
        icon: Icons.bookmark_outline_rounded,
        label: 'Saved',
        color: const Color(0xFF8B5CF6),
        onTap: () => shell.selectTab(3),
      ),
      _QuickAction(
        icon: Icons.search_rounded,
        label: 'Search',
        color: const Color(0xFFF59E0B),
        onTap: () => context.push('/search'),
      ),
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
      child: Row(
        children: actions
            .map(
              (action) => Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: action,
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: c.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: c.border),
          ),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              SizedBox(height: 8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: c.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
