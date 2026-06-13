import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../core/storage/secure_storage.dart';
import '../models/course.dart';

class SavedCoursesService {
  SavedCoursesService({FlutterSecureStorage? storage})
      : _storage = storage ?? createSecureStorage();

  final FlutterSecureStorage _storage;

  String _key(String userId) => 'saved_courses_$userId';

  Future<List<Course>> getSavedCourses(String userId) async {
    final raw = await _storage.read(key: _key(userId));
    if (raw == null || raw.isEmpty) return [];

    final decoded = jsonDecode(raw);
    if (decoded is! List) return [];

    return decoded
        .whereType<Map>()
        .map((item) => Course.fromJson(Map<String, dynamic>.from(item)))
        .toList();
  }

  Future<void> saveCourses(String userId, List<Course> courses) async {
    await _storage.write(
      key: _key(userId),
      value: jsonEncode(courses.map((c) => c.toStorageJson()).toList()),
    );
  }
}
