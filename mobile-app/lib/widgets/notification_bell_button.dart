import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
import '../providers/notification_provider.dart';

class NotificationBellButton extends StatelessWidget {
  const NotificationBellButton({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final unread = context.watch<NotificationProvider>().unreadCount;

    return Stack(
      clipBehavior: Clip.none,
      children: [
        IconButton(
          onPressed: () => context.push('/notifications'),
          icon: Icon(Icons.notifications_none_rounded, color: AppColors.primary),
          style: IconButton.styleFrom(
            backgroundColor: c.surface,
            side: BorderSide(color: c.border),
          ),
        ),
        if (unread > 0)
          Positioned(
            right: 6,
            top: 6,
            child: Container(
              constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
              padding: const EdgeInsets.symmetric(horizontal: 5),
              decoration: BoxDecoration(
                color: AppColors.error,
                borderRadius: BorderRadius.circular(99),
                border: Border.all(color: c.surface, width: 1.5),
              ),
              alignment: Alignment.center,
              child: Text(
                unread > 9 ? '9+' : '$unread',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  height: 1,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
