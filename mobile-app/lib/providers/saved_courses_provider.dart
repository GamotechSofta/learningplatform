import 'package:flutter/foundation.dart';

import '../core/utils/course_playability.dart';
import '../models/course.dart';
import '../services/saved_courses_service.dart';

class SavedCoursesProvider extends ChangeNotifier {
  SavedCoursesProvider(this._service);

  final SavedCoursesService _service;

  List<Course> _courses = [];

  List<Course> get courses => List.unmodifiable(_courses);

  bool isSaved(String courseId) => _courses.any((course) => course.id == courseId);

  Future<void> loadForUser(String userId) async {
    final saved = await _service.getSavedCourses(userId);
    _courses = CoursePlayability.filterListable(saved);
    if (_courses.length != saved.length) {
      await _service.saveCourses(userId, _courses);
    }
    notifyListeners();
  }

  Future<bool> toggle(Course course, String userId) async {
    final wasSaved = isSaved(course.id);
    if (!wasSaved && !CoursePlayability.isListable(course)) return false;
    if (wasSaved) {
      _courses = _courses.where((c) => c.id != course.id).toList();
    } else {
      _courses = [course, ..._courses.where((c) => c.id != course.id)];
    }

    await _service.saveCourses(userId, _courses);
    notifyListeners();
    return !wasSaved;
  }

  Future<void> remove(String courseId, String userId) async {
    if (!isSaved(courseId)) return;
    _courses = _courses.where((c) => c.id != courseId).toList();
    await _service.saveCourses(userId, _courses);
    notifyListeners();
  }

  void clear() {
    _courses = [];
    notifyListeners();
  }
}
