import 'package:flutter/material.dart';

import '../core/utils/notification_builder.dart';
import '../models/app_notification.dart';
import '../services/notification_service.dart';

class NotificationProvider extends ChangeNotifier {
  NotificationProvider(this._service);

  final NotificationService _service;

  String? _userId;
  final Set<String> _readIds = {};
  List<AppNotification> _notifications = [];

  List<AppNotification> get notifications => List.unmodifiable(_notifications);

  int get unreadCount =>
      _notifications.where((notification) => !notification.isRead).length;

  Future<void> loadForUser(String userId) async {
    _userId = userId;
    await _reloadReadIds(userId);
    _notifications = [];
    notifyListeners();
  }

  Future<void> syncForUser({
    required String userId,
    required NotificationBuildInput input,
  }) async {
    if (_userId != userId) {
      _userId = userId;
      await _reloadReadIds(userId);
    }

    _notifications = NotificationBuilder.build(input, readIds: _readIds);
    notifyListeners();
  }

  Future<void> _reloadReadIds(String userId) async {
    _readIds
      ..clear()
      ..addAll(await _service.getReadIds(userId));
  }

  void clear() {
    _userId = null;
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
