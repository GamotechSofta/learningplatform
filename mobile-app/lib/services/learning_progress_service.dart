import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../core/storage/secure_storage.dart';
import '../models/certificate.dart';

class LearningProgressService {
  LearningProgressService({FlutterSecureStorage? storage})
      : _storage = storage ?? createSecureStorage();

  final FlutterSecureStorage _storage;

  String _progressKey(String userId) => 'learning_progress_$userId';
  String _certificatesKey(String userId) => 'learning_certificates_$userId';
  String _totalsKey(String userId) => 'learning_totals_$userId';
  String _metaKey(String userId) => 'learning_meta_$userId';

  Future<Map<String, List<String>>> getProgress(String userId) async {
    final raw = await _storage.read(key: _progressKey(userId));
    if (raw == null || raw.isEmpty) return {};

    final decoded = jsonDecode(raw);
    if (decoded is! Map) return {};

    return decoded.map((courseId, videos) {
      final list = videos is List ? videos.map((v) => v.toString()).toList() : <String>[];
      return MapEntry(courseId.toString(), list);
    });
  }

  Future<void> saveProgress(String userId, Map<String, List<String>> progress) async {
    await _storage.write(
      key: _progressKey(userId),
      value: jsonEncode(progress),
    );
  }

  Future<List<CourseCertificate>> getCertificates(String userId) async {
    final raw = await _storage.read(key: _certificatesKey(userId));
    if (raw == null || raw.isEmpty) return [];

    final decoded = jsonDecode(raw);
    if (decoded is! List) return [];

    return decoded
        .whereType<Map>()
        .map((item) => CourseCertificate.fromJson(Map<String, dynamic>.from(item)))
        .toList();
  }

  Future<void> saveCertificates(String userId, List<CourseCertificate> certificates) async {
    await _storage.write(
      key: _certificatesKey(userId),
      value: jsonEncode(certificates.map((c) => c.toJson()).toList()),
    );
  }

  Future<Map<String, int>> getCourseTotals(String userId) async {
    final raw = await _storage.read(key: _totalsKey(userId));
    if (raw == null || raw.isEmpty) return {};

    final decoded = jsonDecode(raw);
    if (decoded is! Map) return {};

    return decoded.map(
      (courseId, total) => MapEntry(courseId.toString(), (total as num?)?.toInt() ?? 0),
    );
  }

  Future<void> saveCourseTotals(String userId, Map<String, int> totals) async {
    await _storage.write(key: _totalsKey(userId), value: jsonEncode(totals));
  }

  Future<Map<String, Map<String, dynamic>>> getCourseMeta(String userId) async {
    final raw = await _storage.read(key: _metaKey(userId));
    if (raw == null || raw.isEmpty) return {};

    final decoded = jsonDecode(raw);
    if (decoded is! Map) return {};

    return decoded.map((courseId, value) {
      if (value is Map) {
        return MapEntry(courseId.toString(), Map<String, dynamic>.from(value));
      }
      return MapEntry(courseId.toString(), <String, dynamic>{});
    });
  }

  Future<void> saveCourseMeta(String userId, Map<String, Map<String, dynamic>> meta) async {
    await _storage.write(key: _metaKey(userId), value: jsonEncode(meta));
  }
}
