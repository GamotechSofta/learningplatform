import 'package:flutter/material.dart';

class AppNotification {
  const AppNotification({
    required this.id,
    required this.icon,
    required this.color,
    required this.title,
    required this.body,
    required this.occurredAt,
    this.route,
    this.isRead = false,
  });

  final String id;
  final IconData icon;
  final Color color;
  final String title;
  final String body;
  final DateTime occurredAt;
  final String? route;
  final bool isRead;

  AppNotification copyWith({bool? isRead}) {
    return AppNotification(
      id: id,
      icon: icon,
      color: color,
      title: title,
      body: body,
      occurredAt: occurredAt,
      route: route,
      isRead: isRead ?? this.isRead,
    );
  }
}
