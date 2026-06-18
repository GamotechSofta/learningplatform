import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
import '../core/utils/notification_builder.dart';
import '../models/app_notification.dart';
import '../providers/notification_provider.dart';
import '../core/utils/notification_sync.dart';
import '../widgets/page_app_bar.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      syncUserNotifications(context);
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final provider = context.watch<NotificationProvider>();
    final items = provider.notifications;

    return Scaffold(
      backgroundColor: c.background,
      appBar: PageAppBar(
        backgroundColor: c.background,
        title: const Text('Notifications'),
        actions: [
          if (provider.unreadCount > 0)
            TextButton(
              onPressed: () async {
                await provider.markAllAsRead();
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('All notifications marked as read')),
                  );
                }
              },
              child: Text('Mark all read'),
            ),
        ],
      ),
      body: items.isEmpty
          ? Center(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.notifications_none_rounded,
                      size: 48,
                      color: c.textSecondary,
                    ),
                    SizedBox(height: 12),
                    Text(
                      'No notifications yet',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: c.textPrimary,
                      ),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'Updates about your courses, progress, and certificates will appear here.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: c.textSecondary),
                    ),
                  ],
                ),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = items[index];
                return _NotificationCard(
                  item: item,
                  onTap: () async {
                    await provider.markAsRead(item.id);
                    if (!context.mounted || item.route == null) return;
                    context.push(item.route!);
                  },
                );
              },
            ),
    );
  }
}

String _timeLabel(AppNotification item) {
  if (item.id.startsWith('enrolled:')) return 'Enrolled';
  return NotificationBuilder.formatRelativeTime(item.occurredAt);
}

class _NotificationCard extends StatelessWidget {
  const _NotificationCard({
    required this.item,
    required this.onTap,
  });

  final AppNotification item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Material(
      color: c.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: item.isRead ? c.border : AppColors.primary.withValues(alpha: 0.45),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: item.color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(item.icon, color: item.color, size: 22),
              ),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            item.title,
                            style: TextStyle(
                              fontWeight: item.isRead ? FontWeight.w600 : FontWeight.w800,
                              fontSize: 15,
                              color: c.textPrimary,
                            ),
                          ),
                        ),
                        if (!item.isRead)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppColors.error,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    SizedBox(height: 4),
                    Text(
                      item.body,
                      style: TextStyle(
                        fontSize: 13,
                        color: c.textSecondary,
                        height: 1.4,
                      ),
                    ),
                    SizedBox(height: 6),
                    Text(
                      _timeLabel(item),
                      style: TextStyle(fontSize: 11, color: c.textSecondary),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
