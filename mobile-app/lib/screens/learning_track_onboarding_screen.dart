import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/constants/learning_tracks.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
import '../providers/auth_provider.dart';

class LearningTrackOnboardingScreen extends StatefulWidget {
  const LearningTrackOnboardingScreen({super.key});

  @override
  State<LearningTrackOnboardingScreen> createState() =>
      _LearningTrackOnboardingScreenState();
}

class _LearningTrackOnboardingScreenState
    extends State<LearningTrackOnboardingScreen> {
  String? _selected;
  bool _saving = false;

  Future<void> _save(String trackId) async {
    setState(() {
      _selected = trackId;
      _saving = true;
    });

    await context.read<AuthProvider>().updateLearningTrack(trackId);
    if (!mounted) return;
    context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final auth = context.watch<AuthProvider>();
    final firstName = auth.user?.name.split(' ').first ?? 'there';

    return Scaffold(
      backgroundColor: c.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hi $firstName 👋',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: c.textPrimary,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Which standard or goal are you preparing for? We\'ll recommend the best courses on your home page.',
                    style: TextStyle(
                      fontSize: 15,
                      height: 1.45,
                      color: c.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  for (final option in LearningTracks.options)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _TrackCard(
                        option: option,
                        selected: _selected == option.id,
                        enabled: !_saving,
                        onTap: () => _save(option.id),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
              child: TextButton(
                onPressed: _saving
                    ? null
                    : () => _save(LearningTracks.exploreAll),
                child: const Text('Skip — show all courses'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TrackCard extends StatelessWidget {
  const _TrackCard({
    required this.option,
    required this.selected,
    required this.enabled,
    required this.onTap,
  });

  final LearningTrackOption option;
  final bool selected;
  final bool enabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Material(
      color: selected ? c.primaryTint : c.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: enabled ? onTap : null,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected ? AppColors.primary : c.border,
              width: selected ? 1.5 : 1,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(option.icon, color: AppColors.primary),
              ),
              SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      option.title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: c.textPrimary,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      option.subtitle,
                      style: TextStyle(
                        fontSize: 13,
                        color: c.textSecondary,
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.chevron_right_rounded,
                color: selected ? AppColors.primary : c.textSecondary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
