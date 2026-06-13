import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/constants/learning_tracks.dart';
import '../../core/theme/app_colors.dart';
import '../../navigation/main_shell_scope.dart';
import '../../providers/auth_provider.dart';
import '../notification_bell_button.dart';

class HomeHeader extends StatelessWidget {
  const HomeHeader({super.key});

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  String _subtitle(AuthProvider auth) {
    if (!auth.isAuthenticated) {
      return 'Explore courses for boards, JEE & career skills';
    }
    final track = auth.user?.learningTrack;
    if (track != null &&
        track.isNotEmpty &&
        track != LearningTracks.exploreAll) {
      return 'Personalized for ${LearningTracks.label(track)}';
    }
    return 'Ready to pick up where you left off?';
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final shell = MainShellScope.of(context);
    final name = auth.isAuthenticated ? auth.user!.name.split(' ').first : 'Learner';

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
      child: Row(
        children: [
          IconButton(
            onPressed: shell.openDrawer,
            icon: const Icon(Icons.menu_rounded, color: AppColors.textPrimary),
            style: IconButton.styleFrom(
              backgroundColor: AppColors.surface,
              side: const BorderSide(color: AppColors.border),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${_greeting()}, $name',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  _subtitle(auth),
                  style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          const NotificationBellButton(),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => shell.selectTab(4),
            child: CircleAvatar(
              radius: 22,
              backgroundColor: AppColors.primaryLight,
              child: auth.isAuthenticated
                  ? Text(
                      name.isNotEmpty ? name[0].toUpperCase() : '?',
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w800,
                        fontSize: 18,
                      ),
                    )
                  : const Icon(Icons.person_outline, color: AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }
}
