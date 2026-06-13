import '../core/api/api_client.dart';
import '../models/course.dart';

class UserSubscription {
  const UserSubscription({
    required this.course,
    required this.status,
    required this.plan,
    this.amountPaid = 0,
    this.currency = 'INR',
    this.endDate,
  });

  final Course course;
  final String status;
  final String plan;
  final double amountPaid;
  final String currency;
  final DateTime? endDate;

  bool get isActive => status == 'active';

  String get planLabel {
    switch (plan) {
      case 'yearly':
        return 'Yearly';
      case 'lifetime':
        return 'Lifetime';
      default:
        return 'Monthly';
    }
  }

  factory UserSubscription.fromJson(Map<String, dynamic> json) {
    final courseRaw = json['course'];
    final endRaw = json['endDate']?.toString();

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
      amountPaid: (json['amountPaid'] as num?)?.toDouble() ?? 0,
      currency: json['currency']?.toString() ?? 'INR',
      endDate: endRaw != null && endRaw.isNotEmpty ? DateTime.tryParse(endRaw) : null,
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

  Future<UserSubscription> purchaseCourse({
    required String userId,
    required String courseId,
    required String plan,
  }) async {
    return _api.postData(
      '/api/users/$userId/subscriptions/purchase',
      body: {
        'courseId': courseId,
        'plan': plan,
      },
      parser: (data) => UserSubscription.fromJson(Map<String, dynamic>.from(data as Map)),
    );
  }
}
