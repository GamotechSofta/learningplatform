import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/app_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/themed_colors.dart';
import '../../navigation/main_shell_scope.dart';
import '../../providers/auth_provider.dart';
import '../notification_bell_button.dart';

class HomeHeader extends StatelessWidget {
  const HomeHeader({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final auth = context.watch<AuthProvider>();
    final shell = MainShellScope.of(context);
    final name = auth.isAuthenticated ? auth.user!.name.split(' ').first : '';

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
      child: Row(
        children: [
          IconButton(
            onPressed: shell.openDrawer,
            icon: Icon(Icons.menu_rounded, color: c.textPrimary),
            style: IconButton.styleFrom(
              backgroundColor: c.surface,
              side: BorderSide(color: c.border),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              AppConfig.appName,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: c.textPrimary,
              ),
            ),
          ),
          const NotificationBellButton(),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => shell.selectTab(4),
            child: CircleAvatar(
              radius: 22,
              backgroundColor: c.primaryTint,
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
