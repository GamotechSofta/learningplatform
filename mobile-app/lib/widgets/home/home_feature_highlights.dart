import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/themed_colors.dart';

class HomeFeatureHighlights extends StatelessWidget {
  const HomeFeatureHighlights({super.key});

  static const _features = [
    _Feature(
      icon: Icons.verified_user_outlined,
      title: 'Expert-led',
      subtitle: 'Structured lessons from experienced educators',
    ),
    _Feature(
      icon: Icons.hd_outlined,
      title: 'HD lessons',
      subtitle: 'Clear video playback on any device',
    ),
    _Feature(
      icon: Icons.trending_up_rounded,
      title: 'Track progress',
      subtitle: 'Resume lessons and pick up where you left off',
    ),
    _Feature(
      icon: Icons.devices_outlined,
      title: 'Learn anywhere',
      subtitle: 'Pick up right where you left off',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Why learners choose Vidyank',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: c.textPrimary,
            ),
          ),
          SizedBox(height: 6),
          Text(
            'Built for school boards, JEE prep, and career-ready skills.',
            style: TextStyle(fontSize: 13, color: c.textSecondary),
          ),
          const SizedBox(height: 14),
          ..._features.map(
            (feature) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: _FeatureRow(feature: feature),
            ),
          ),
        ],
      ),
    );
  }
}

class _Feature {
  const _Feature({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;
}

class _FeatureRow extends StatelessWidget {
  const _FeatureRow({required this.feature});

  final _Feature feature;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: c.border),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: c.primaryTint,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(feature.icon, color: AppColors.primary, size: 22),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  feature.title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: c.textPrimary,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  feature.subtitle,
                  style: TextStyle(
                    fontSize: 12,
                    color: c.textSecondary,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
