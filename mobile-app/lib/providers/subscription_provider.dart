import 'package:flutter/foundation.dart';

import '../services/subscription_service.dart';

class SubscriptionProvider extends ChangeNotifier {
  SubscriptionProvider(this._subscriptionService);

  final SubscriptionService _subscriptionService;

  final Set<String> _activeCourseIds = {};
  List<UserSubscription> _subscriptions = [];
  bool _loading = false;

  bool get loading => _loading;
  Set<String> get activeCourseIds => Set.unmodifiable(_activeCourseIds);
  List<UserSubscription> get activeSubscriptions =>
      _subscriptions.where((sub) => sub.isActive).toList();

  bool hasAccess(String courseId) => _activeCourseIds.contains(courseId);

  void _applySubscriptions(List<UserSubscription> subs) {
    _subscriptions = subs;
    _activeCourseIds
      ..clear()
      ..addAll(
        subs
            .where((sub) => sub.isActive)
            .map((sub) => sub.course.id)
            .where((id) => id.isNotEmpty),
      );
  }

  Future<void> refresh(String userId, {bool forceRefresh = false}) async {
    if (_loading && !forceRefresh) return;

    if (_loading && forceRefresh) {
      while (_loading) {
        await Future<void>.delayed(const Duration(milliseconds: 50));
      }
    }

    _loading = true;
    notifyListeners();

    try {
      final subs = await _subscriptionService.getUserSubscriptions(
        userId,
        forceRefresh: forceRefresh,
      );
      _applySubscriptions(subs);
    } catch (_) {
      if (_subscriptions.isEmpty) {
        final fromDisk = await _subscriptionService.getSubscriptionsFromDisk(userId);
        if (fromDisk.isNotEmpty) {
          _applySubscriptions(fromDisk);
        }
      }
    }

    _loading = false;
    notifyListeners();
  }

  Future<void> purchase({
    required String userId,
    required String courseId,
    required String plan,
  }) async {
    final created = await _subscriptionService.purchaseCourse(
      userId: userId,
      courseId: courseId,
      plan: plan,
    );
    _subscriptionService.invalidateUser(userId);
    _activeCourseIds.add(courseId);
    _subscriptions = [
      created,
      ..._subscriptions.where((sub) => sub.course.id != courseId),
    ];
    notifyListeners();
  }

  void clear() {
    _activeCourseIds.clear();
    _subscriptions = [];
    notifyListeners();
  }
}
