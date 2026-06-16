import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/constants/learning_tracks.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
import '../navigation/main_shell_scope.dart';
import '../providers/auth_provider.dart';
import '../providers/learning_progress_provider.dart';
import '../providers/notification_provider.dart';
import '../providers/saved_courses_provider.dart';
import '../providers/subscription_provider.dart';
import '../providers/theme_provider.dart';
import '../providers/video_engagement_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final auth = context.watch<AuthProvider>();

    if (auth.loading) {
      return Scaffold(
        backgroundColor: c.background,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (!auth.isAuthenticated) {
      return Scaffold(
        backgroundColor: c.background,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 88,
                  height: 88,
                  decoration: BoxDecoration(
                    color: c.primaryTint,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Icon(Icons.person_outline, size: 44, color: AppColors.primary),
                ),
                const SizedBox(height: 20),
                Text(
                  'Welcome to Vidyank',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: c.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Sign in to track progress, enroll in courses, and earn certificates.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: c.textSecondary, height: 1.5),
                ),
                const SizedBox(height: 28),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => context.push('/login'),
                    child: const Text('Login'),
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => context.push('/register'),
                    child: const Text('Create account'),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final user = auth.user!;
    final firstName = user.name.split(' ').first;
    final progress = context.watch<LearningProgressProvider>();
    final subs = context.watch<SubscriptionProvider>();
    final saved = context.watch<SavedCoursesProvider>();
    final downloads = context.watch<VideoEngagementProvider>();

    final videosWatched = subs.activeSubscriptions.fold<int>(
      0,
      (sum, sub) => sum + progress.watchedCountFor(sub.course.id),
    );

    return Scaffold(
      backgroundColor: c.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 38,
                  backgroundColor: c.primaryTint,
                  child: Text(
                    firstName.isNotEmpty ? firstName[0].toUpperCase() : '?',
                    style: const TextStyle(
                      fontSize: 30,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.name,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: c.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user.email,
                        style: TextStyle(
                          color: c.textSecondary,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _StatTile(
                    icon: Icons.play_circle_outline_rounded,
                    value: '$videosWatched',
                    label: 'Videos',
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _StatTile(
                    icon: Icons.school_outlined,
                    value: '${subs.activeSubscriptions.length}',
                    label: 'Courses',
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _StatTile(
                    icon: Icons.workspace_premium_outlined,
                    value: '${progress.certificates.length}',
                    label: 'Certs',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (user.hasLearningTrack)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: c.primaryTint.withValues(alpha: 0.55),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.25)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.track_changes_rounded, color: AppColors.primary),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Learning goal: ${LearningTracks.label(user.learningTrack)}',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: c.textPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 16),
            _ProfileMenuItem(
              icon: Icons.dark_mode_outlined,
              title: context.watch<ThemeProvider>().isDark ? 'Light mode' : 'Dark mode',
              onTap: () => context.read<ThemeProvider>().toggle(),
            ),
            _ProfileMenuItem(
              icon: Icons.school_outlined,
              title: 'Change learning goal',
              onTap: () => context.push('/onboarding/learning-track'),
            ),
            _ProfileMenuItem(
              icon: Icons.menu_book_rounded,
              title: 'My Courses',
              subtitle: '${subs.activeSubscriptions.length} enrolled',
              onTap: () => MainShellScope.of(context).selectTab(2),
            ),
            _ProfileMenuItem(
              icon: Icons.notifications_none_rounded,
              title: 'Notifications',
              onTap: () => context.push('/notifications'),
            ),
            _ProfileMenuItem(
              icon: Icons.bookmark_rounded,
              title: 'Saved Courses',
              subtitle: '${saved.courses.length} saved',
              onTap: () => MainShellScope.of(context).selectTab(3),
            ),
            _ProfileMenuItem(
              icon: Icons.download_rounded,
              title: 'Downloaded videos',
              subtitle: downloads.downloadCount == 0
                  ? 'Watch offline in the app'
                  : '${downloads.downloadCount} saved',
              onTap: () => context.push('/downloads'),
            ),
            _ProfileMenuItem(
              icon: Icons.help_outline_rounded,
              title: 'Help & Support',
              onTap: () {},
            ),
            const SizedBox(height: 12),
            _ProfileMenuItem(
              icon: Icons.logout_rounded,
              title: 'Logout',
              titleColor: AppColors.logoutRed,
              iconColor: AppColors.logoutRed,
              showChevron: false,
              onTap: () async {
                await auth.logout();
                if (context.mounted) {
                  context.read<SubscriptionProvider>().clear();
                  context.read<LearningProgressProvider>().clear();
                  context.read<SavedCoursesProvider>().clear();
                  context.read<NotificationProvider>().clear();
                  context.read<VideoEngagementProvider>().clear();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Logged out successfully')),
                  );
                  context.go('/login');
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.icon,
    required this.value,
    required this.label,
  });

  final IconData icon;
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: c.border),
      ),
      child: Column(
        children: [
          Icon(icon, color: AppColors.primary, size: 20),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: c.textPrimary,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: c.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  const _ProfileMenuItem({
    required this.icon,
    required this.title,
    required this.onTap,
    this.subtitle,
    this.titleColor,
    this.iconColor,
    this.showChevron = true,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;
  final Color? titleColor;
  final Color? iconColor;
  final bool showChevron;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          decoration: BoxDecoration(
            color: c.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: c.border),
          ),
          child: Row(
            children: [
              Icon(icon, color: iconColor ?? AppColors.primary, size: 22),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                        color: titleColor ?? c.textPrimary,
                      ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        subtitle!,
                        style: TextStyle(
                          fontSize: 12,
                          color: c.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (showChevron)
                Icon(Icons.chevron_right, color: c.textSecondary, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}
