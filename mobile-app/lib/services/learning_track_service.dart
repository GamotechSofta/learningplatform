import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../core/storage/secure_storage.dart';

class LearningTrackService {
  LearningTrackService({FlutterSecureStorage? storage})
      : _storage = storage ?? createSecureStorage();

  final FlutterSecureStorage _storage;

  String _key(String userId) => 'learning_track_$userId';

  Future<String?> getLocalTrack(String userId) async {
    final value = await _storage.read(key: _key(userId));
    if (value == null || value.isEmpty) return null;
    return value;
  }

  Future<void> saveLocalTrack(String userId, String track) async {
    await _storage.write(key: _key(userId), value: track);
  }

  Future<void> clearLocalTrack(String userId) async {
    await _storage.delete(key: _key(userId));
  }
}
