import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../core/storage/secure_storage.dart';

class NotificationService {
  NotificationService({FlutterSecureStorage? storage})
      : _storage = storage ?? createSecureStorage();

  final FlutterSecureStorage _storage;

  String _readKey(String userId) => 'notification_read_$userId';

  Future<Set<String>> getReadIds(String userId) async {
    final raw = await _storage.read(key: _readKey(userId));
    if (raw == null || raw.isEmpty) return {};

    final decoded = jsonDecode(raw);
    if (decoded is! List) return {};

    return decoded.map((id) => id.toString()).toSet();
  }

  Future<void> saveReadIds(String userId, Set<String> readIds) async {
    await _storage.write(
      key: _readKey(userId),
      value: jsonEncode(readIds.toList()),
    );
  }
}
