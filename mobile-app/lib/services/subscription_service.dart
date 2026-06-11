import '../core/api/api_client.dart';
import '../models/course.dart';

class UserSubscription {
  const UserSubscription({
    required this.course,
    required this.status,
    required this.plan,
  });

  final Course course;
  final String status;
  final String plan;

  bool get isActive => status == 'active';

  factory UserSubscription.fromJson(Map<String, dynamic> json) {
    final courseRaw = json['course'];
    return UserSubscription(
      course: courseRaw is Map
          ? Course.fromJson(Map<String, dynamic>.from(courseRaw))
          : const Course(
              id: '',
              title: 'Course',
              slug: '',
              description: '',
            ),
      status: json['status']?.toString() ?? 'pending',
      plan: json['plan']?.toString() ?? 'monthly',
    );
  }
}

class SubscriptionService {
  SubscriptionService(this._api);

  final ApiClient _api;

  Future<List<UserSubscription>> getUserSubscriptions(String userId) async {
    return _api.getData(
      '/api/users/$userId/subscriptions',
      parser: (data) => _api.parseList(
        data,
        (json) => UserSubscription.fromJson(json),
      ),
    );
  }
}
