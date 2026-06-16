import 'package:flutter/foundation.dart' show ChangeNotifier;

import '../core/utils/api_errors.dart';
import '../models/category.dart';
import '../models/course.dart';
import '../services/category_service.dart';
import '../services/course_service.dart';

/// Shared catalog state so Home and Courses don't fetch the same data twice.
class CatalogProvider extends ChangeNotifier {
  CatalogProvider(this._categoryService, this._courseService);

  final CategoryService _categoryService;
  final CourseService _courseService;

  List<Category> _categories = [];
  List<Course> _courses = [];
  bool _loading = false;
  bool _loaded = false;
  String? _error;

  List<Category> get categories => List.unmodifiable(_categories);
  List<Course> get courses => List.unmodifiable(_courses);
  bool get loading => _loading;
  bool get loaded => _loaded;
  String? get error => _error;

  void prefetchCourseDetail(String courseId) {
    _courseService.prefetchCourseFull(courseId);
  }

  Future<void> load({bool forceRefresh = false}) async {
    if (_loading) return;
    if (_loaded && !forceRefresh) return;

    if (forceRefresh) {
      _courseService.invalidatePublishedList();
      _categoryService.invalidatePublishedList();
    }

    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        _categoryService.getPublishedCategories(forceRefresh: forceRefresh),
        _courseService.getPublishedCourses(forceRefresh: forceRefresh),
      ]);

      _categories = results[0] as List<Category>;
      _courses = results[1] as List<Course>;
      _loaded = true;
    } catch (error) {
      _error = ApiErrors.friendlyMessage(error);
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> warmFromDisk() async {
    if (_loaded) return;

    try {
      final results = await Future.wait([
        _categoryService.getPublishedCategoriesFromDisk(),
        _courseService.getPublishedCoursesFromDisk(),
      ]);

      final categories = results[0] as List<Category>;
      final courses = results[1] as List<Course>;
      if (categories.isEmpty && courses.isEmpty) return;

      _categories = categories;
      _courses = courses;
      notifyListeners();
    } catch (_) {
      // Best-effort warm start.
    }
  }
}
