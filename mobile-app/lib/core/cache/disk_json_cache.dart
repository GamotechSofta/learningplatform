import 'dart:convert';
import 'dart:io';

import 'package:path_provider/path_provider.dart';

/// Persists API JSON payloads to disk for offline / fast cold starts.
class DiskJsonCache {
  DiskJsonCache(this._dir);

  final Directory _dir;

  static DiskJsonCache? _instance;

  static Future<DiskJsonCache> get instance async {
    if (_instance != null) return _instance!;
    final base = await getApplicationSupportDirectory();
    final dir = Directory('${base.path}/api_cache');
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    _instance = DiskJsonCache(dir);
    return _instance!;
  }

  Future<List<Map<String, dynamic>>?> readList(
    String key,
    Duration maxAge,
  ) async {
    final payload = await _readPayload(key, maxAge);
    if (payload == null) return null;
    if (payload is! List) return null;
    return payload
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
  }

  Future<Map<String, dynamic>?> readObject(
    String key,
    Duration maxAge,
  ) async {
    final payload = await _readPayload(key, maxAge);
    if (payload is! Map) return null;
    return Map<String, dynamic>.from(payload);
  }

  Future<void> writeList(String key, List<Map<String, dynamic>> data) =>
      _write(key, data);

  Future<void> writeObject(String key, Map<String, dynamic> data) =>
      _write(key, data);

  Future<dynamic> _readPayload(String key, Duration maxAge) async {
    try {
      final file = File('${_dir.path}/$key.json');
      if (!await file.exists()) return null;

      final decoded = jsonDecode(await file.readAsString());
      if (decoded is! Map) return null;

      final savedAtRaw = decoded['savedAt']?.toString();
      if (savedAtRaw == null) return null;

      final savedAt = DateTime.tryParse(savedAtRaw);
      if (savedAt == null) return null;
      if (DateTime.now().difference(savedAt) > maxAge) return null;

      return decoded['data'];
    } catch (_) {
      return null;
    }
  }

  Future<void> _write(String key, dynamic data) async {
    try {
      final file = File('${_dir.path}/$key.json');
      await file.writeAsString(
        jsonEncode({
          'savedAt': DateTime.now().toIso8601String(),
          'data': data,
        }),
      );
    } catch (_) {
      // Disk cache is best-effort.
    }
  }
}
