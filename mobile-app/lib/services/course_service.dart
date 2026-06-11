import '../core/api/api_client.dart';
import '../models/course.dart';

class CourseService {
  CourseService(this._api);

  final ApiClient _api;

  Future<Course> getCourseFull(String id) async {
    return _api.getData(
      '/api/courses/$id/full',
      parser: (data) => Course.fromJson(Map<String, dynamic>.from(data as Map)),
    );
  }

  Future<List<Course>> getPublishedCourses({String? categoryId}) async {
    final params = <String, dynamic>{'published': 'true'};
    if (categoryId != null) params['category'] = categoryId;

    return _api.getData(
      '/api/courses',
      queryParameters: params,
      parser: (data) => _api.parseList(data, Course.fromJson),
    );
  }
}
