import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/theme/themed_colors.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../providers/video_engagement_provider.dart';
import 'app_logo.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key, required this.onSelectTab});

  final void Function(int index) onSelectTab;

  void _closeAndSelect(BuildContext context, int tab) {
    Navigator.pop(context);
    onSelectTab(tab);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final auth = context.watch<AuthProvider>();
    final theme = context.watch<ThemeProvider>();
    final downloadCount = context.watch<VideoEngagementProvider>().downloadCount;

    return Drawer(
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const AppLogo(height: 40),
                  SizedBox(height: 8),
                  Text(
                    auth.isAuthenticated ? auth.user!.email : 'Sign in to continue',
                    style: TextStyle(color: c.textSecondary),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            ListTile(
              leading: const Icon(Icons.home_outlined),
              title: const Text('Home'),
              onTap: () => _closeAndSelect(context, 0),
            ),
            ListTile(
              leading: const Icon(Icons.menu_book_outlined),
              title: const Text('Courses'),
              onTap: () => _closeAndSelect(context, 1),
            ),
            ListTile(
              leading: const Icon(Icons.play_lesson_outlined),
              title: const Text('My Learning'),
              onTap: () => _closeAndSelect(context, 2),
            ),
            ListTile(
              leading: const Icon(Icons.bookmark_border_rounded),
              title: const Text('Saved Courses'),
              onTap: () => _closeAndSelect(context, 3),
            ),
            ListTile(
              leading: const Icon(Icons.download_rounded),
              title: const Text('Downloaded videos'),
              trailing: downloadCount > 0
                  ? Text(
                      '$downloadCount',
                      style: TextStyle(
                        color: c.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    )
                  : null,
              onTap: () {
                Navigator.pop(context);
                context.push('/downloads');
              },
            ),
            ListTile(
              leading: const Icon(Icons.person_outline),
              title: const Text('Profile'),
              onTap: () => _closeAndSelect(context, 4),
            ),
            ListTile(
              leading: const Icon(Icons.notifications_none_rounded),
              title: const Text('Notifications'),
              onTap: () {
                Navigator.pop(context);
                context.push('/notifications');
              },
            ),
            const Divider(height: 1),
            ListTile(
              leading: Icon(
                theme.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
              ),
              title: Text(theme.isDark ? 'Light mode' : 'Dark mode'),
              onTap: () => context.read<ThemeProvider>().toggle(),
            ),
            const Spacer(),
            if (auth.isAuthenticated) ...[
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Icons.logout_rounded),
                title: const Text('Logout'),
                onTap: () async {
                  Navigator.pop(context);
                  await auth.logout();
                  if (context.mounted) context.go('/login');
                },
              ),
            ],
          ],
        ),
      ),
    );
  }
}
