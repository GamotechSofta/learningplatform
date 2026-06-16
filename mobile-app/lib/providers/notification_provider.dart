import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';
import '../core/utils/notification_builder.dart';
import '../models/app_notification.dart';
import '../services/notification_service.dart';

class NotificationProvider extends ChangeNotifier {
  NotificationProvider(this._service);

  final NotificationService _service;

  String? _userId;
  DateTime? _installedAt;
  final Set<String> _readIds = {};
  List<AppNotification> _notifications = [];

  List<AppNotification> get notifications => List.unmodifiable(_notifications);

  int get unreadCount =>
      _notifications.where((notification) => !notification.isRead).length;

  Future<void> loadForUser(String userId) async {
    _userId = userId;
    _installedAt = await _service.ensureInstallAt(userId);
    await _reloadReadIds(userId);
    _notifications = _withInstallNotification(const []);
    notifyListeners();
  }

  Future<void> syncForUser({
    required String userId,
    required NotificationBuildInput input,
  }) async {
    if (_userId != userId) {
      _userId = userId;
      _installedAt = await _service.ensureInstallAt(userId);
      await _reloadReadIds(userId);
    }

    final built = NotificationBuilder.build(input, readIds: _readIds);
    _notifications = _withInstallNotification(built);
    notifyListeners();
  }

  List<AppNotification> _withInstallNotification(List<AppNotification> base) {
    final installAt = _installedAt;
    if (installAt == null) return base;

    const id = 'welcome:install';
    final welcome = AppNotification(
      id: id,
      icon: Icons.notifications_active_outlined,
      color: AppColors.primary,
      title: 'Welcome to Vidyank',
      body:
          'Thanks for installing the app. Start your first lesson and keep learning every day.',
      occurredAt: installAt,
      route: '/',
      isRead: _readIds.contains(id),
    );

    final items = <AppNotification>[
      welcome,
      ...base.where((notification) => notification.id != id),
    ];
    items.sort((a, b) => b.occurredAt.compareTo(a.occurredAt));
    return items;
  }

  Future<void> _reloadReadIds(String userId) async {
    _readIds
      ..clear()
      ..addAll(await _service.getReadIds(userId));
  }

  void clear() {
    _userId = null;
    _installedAt = null;
    _readIds.clear();
    _notifications = [];
    notifyListeners();
  }

  Future<void> markAsRead(String id) async {
    if (_userId == null) return;

    _readIds.add(id);
    await _service.saveReadIds(_userId!, _readIds);

    final index = _notifications.indexWhere((n) => n.id == id);
    if (index != -1 && !_notifications[index].isRead) {
      _notifications[index] = _notifications[index].copyWith(isRead: true);
      notifyListeners();
    }
  }

  Future<void> markAllAsRead() async {
    if (_userId == null || _notifications.isEmpty) return;

    for (final notification in _notifications) {
      _readIds.add(notification.id);
    }
    await _service.saveReadIds(_userId!, _readIds);

    _notifications = _notifications
        .map((notification) => notification.copyWith(isRead: true))
        .toList();
    notifyListeners();
  }
}
