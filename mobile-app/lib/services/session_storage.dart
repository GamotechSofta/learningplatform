import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../core/storage/secure_storage.dart';
import '../models/user.dart';

class SessionStorage {
  SessionStorage({FlutterSecureStorage? storage})
      : _storage = storage ?? createSecureStorage();

  final FlutterSecureStorage _storage;

  static const _tokenKey = 'auth_token';
  static const _userKey = 'auth_user';

  Future<String?> readToken() => _storage.read(key: _tokenKey);

  Future<void> saveToken(String token) =>
      _storage.write(key: _tokenKey, value: token);

  Future<void> saveUser(User user) async {
    await _storage.write(
      key: _userKey,
      value: jsonEncode(user.toSessionJson()),
    );
  }

  Future<User?> readUser() async {
    final raw = await _storage.read(key: _userKey);
    if (raw == null || raw.isEmpty) return null;

    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map) return null;
      return User.fromJson(Map<String, dynamic>.from(decoded));
    } catch (_) {
      return null;
    }
  }

  Future<User?> readSession() async {
    final token = await readToken();
    if (token == null || token.isEmpty) return null;

    final user = await readUser();
    if (user == null) return null;

    return user.copyWith(token: token);
  }

  Future<void> clearSession() async {
    await Future.wait([
      _storage.delete(key: _tokenKey),
      _storage.delete(key: _userKey),
    ]);
  }
}
