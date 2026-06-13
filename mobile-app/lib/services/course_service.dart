import '../core/api/api_client.dart';
import '../core/utils/course_playability.dart';
import '../models/course.dart';

class CourseService {
  CourseService(this._api);

  final ApiClient _api;

  Future<Course> getCourseFull(String id) async {
    return _api.getData(
      '/api/courses/$id/full',
      parser: (data) => Course.fromJson(
        Map<String, dynamic>.from(data as Map),
        includeAllPlayable: true,
      ),
    );
  }

  Future<List<Course>> getPublishedCourses({String? categoryId}) async {
    final params = <String, dynamic>{'published': 'true'};
    if (categoryId != null) params['category'] = categoryId;

    final courses = await _api.getData(
      '/api/courses',
      queryParameters: params,
      parser: (data) => _api.parseList(data, Course.fromJson),
    );
    return CoursePlayability.filterListable(courses);
  }
}
