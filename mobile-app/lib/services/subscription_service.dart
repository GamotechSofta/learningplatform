import '../core/api/api_client.dart';
import '../core/cache/app_data_cache.dart';
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

  bool get isActive {
    if (status != 'active') return false;
    final end = endDate;
    if (end != null && !end.isAfter(DateTime.now())) return false;
    return course.id.isNotEmpty;
  }

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
  final AppDataCache _cache = AppDataCache.instance;

  String _diskKey(String userId) => 'user_subscriptions_$userId';

  List<UserSubscription> _parseSubscriptions(List<Map<String, dynamic>> raw) {
    return raw.map(UserSubscription.fromJson).where((sub) => sub.isActive).toList();
  }

  Future<List<UserSubscription>> getSubscriptionsFromDisk(String userId) async {
    final disk = await _cache.disk();
    final raw = await disk.readList(_diskKey(userId), AppDataCache.diskMaxAge);
    if (raw == null) return [];
    return _parseSubscriptions(raw);
  }

  Future<List<UserSubscription>> getUserSubscriptions(
    String userId, {
    bool forceRefresh = false,
  }) async {
    final cacheKey = _diskKey(userId);

    if (!forceRefresh) {
      final fromMemory = _cache.memory.peek<List<UserSubscription>>(
        cacheKey,
        AppDataCache.courseDetailTtl,
      );
      if (fromMemory != null && fromMemory.isNotEmpty) {
        return fromMemory;
      }
    }

    try {
      return await _cache.memory.resolve(
        key: cacheKey,
        ttl: AppDataCache.courseDetailTtl,
        forceRefresh: forceRefresh,
        fetch: () async {
          final raw = await _api.getRawList('/api/users/$userId/subscriptions');
          await (await _cache.disk()).writeList(cacheKey, raw);
          return _parseSubscriptions(raw);
        },
      );
    } catch (error) {
      if (!forceRefresh) {
        final fromDisk = await getSubscriptionsFromDisk(userId);
        if (fromDisk.isNotEmpty) return fromDisk;
      }
      rethrow;
    }
  }

  void invalidateUser(String userId) {
    _cache.memory.invalidate(_diskKey(userId));
  }

  Future<UserSubscription> purchaseCourse({
    required String userId,
    required String courseId,
    required String plan,
  }) async {
    final created = await _api.postData(
      '/api/users/$userId/subscriptions/purchase',
      body: {
        'courseId': courseId,
        'plan': plan,
      },
      parser: (data) => UserSubscription.fromJson(Map<String, dynamic>.from(data as Map)),
    );
    invalidateUser(userId);
    return created;
  }
}
