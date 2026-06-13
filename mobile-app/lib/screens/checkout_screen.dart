import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../core/utils/course_access.dart';
import '../models/course.dart';
import '../providers/auth_provider.dart';
import '../providers/learning_progress_provider.dart';
import '../providers/notification_provider.dart';
import '../providers/subscription_provider.dart';
import '../core/utils/notification_sync.dart';
import '../screens/payu_checkout_screen.dart';
import '../services/course_service.dart';
import '../services/payment_service.dart';
import '../widgets/error_view.dart';
import '../widgets/thumbnail_image.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({
    super.key,
    required this.courseId,
    required this.courseService,
    required this.paymentService,
  });

  final String courseId;
  final CourseService courseService;
  final PaymentService paymentService;

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  late Future<Course> _future;
  String? _selectedPlan;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _future = widget.courseService.getCourseFull(widget.courseId);
  }

  List<_PlanOption> _plansFor(Course course) {
    final pricing = course.pricing;
    final plans = <_PlanOption>[];

    if (pricing.monthly > 0) {
      plans.add(_PlanOption(
        id: 'monthly',
        title: 'Monthly access',
        price: pricing.monthly,
        currency: pricing.currency,
        subtitle: 'Renews every month',
      ));
    }
    if (pricing.yearly > 0) {
      plans.add(_PlanOption(
        id: 'yearly',
        title: 'Yearly access',
        price: pricing.yearly,
        currency: pricing.currency,
        subtitle: 'Best value for committed learners',
        badge: 'Popular',
      ));
    }
    if (pricing.lifetime > 0) {
      plans.add(_PlanOption(
        id: 'lifetime',
        title: 'Lifetime access',
        price: pricing.lifetime,
        currency: pricing.currency,
        subtitle: 'One-time payment, forever access',
      ));
    }

    return plans;
  }

  Future<void> _completePurchase(Course course) async {
    if (_selectedPlan == null || _submitting) return;

    final auth = context.read<AuthProvider>();
    final subs = context.read<SubscriptionProvider>();
    final notifications = context.read<NotificationProvider>();
    final progress = context.read<LearningProgressProvider>();

    if (!auth.isAuthenticated || auth.user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please login to continue')),
      );
      return;
    }

    setState(() => _submitting = true);

    try {
      final payment = await widget.paymentService.initiatePayU(
        courseId: course.id,
        plan: _selectedPlan!,
      );

      if (!mounted) return;

      await Navigator.of(context).push<void>(
        MaterialPageRoute(
          builder: (context) => PayUCheckoutScreen(
            payment: payment,
            paymentService: widget.paymentService,
            onFinished: (status) async {
              Navigator.of(context).pop();

              if (status.isSuccess) {
                await subs.refresh(auth.user!.id);
                await syncNotifications(
                  userId: auth.user!.id,
                  notifications: notifications,
                  subs: subs,
                  progress: progress,
                );
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('"${course.title}" unlocked successfully!')),
                );
                context.go('/courses/${course.id}');
              } else if (status.status == 'pending') {
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                      'Payment is still processing. Pull to refresh My Learning in a moment.',
                    ),
                  ),
                );
              } else {
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Payment was not completed. Please try again.'),
                  ),
                );
              }
            },
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(friendlyPaymentError(error))),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        title: const Text('Checkout'),
      ),
      body: FutureBuilder<Course>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return ErrorView(
              message: snapshot.error.toString(),
              onRetry: () => setState(() {
                _future = widget.courseService.getCourseFull(widget.courseId);
              }),
            );
          }

          final course = snapshot.data!;
          final subs = context.watch<SubscriptionProvider>();
          final isPurchased = CourseAccess.isCoursePurchased(
            course,
            subscriptionActive: subs.hasAccess(course.id),
          );

          if (isPurchased) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.check_circle_rounded, color: AppColors.accentGreen, size: 64),
                    const SizedBox(height: 16),
                    const Text(
                      'Already purchased',
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'You already have full access to this course.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 20),
                    FilledButton(
                      onPressed: () => context.go('/courses/${course.id}'),
                      child: const Text('Go to course'),
                    ),
                  ],
                ),
              ),
            );
          }

          final plans = _plansFor(course);
          _selectedPlan ??= plans.any((p) => p.id == 'yearly')
              ? 'yearly'
              : (plans.isNotEmpty ? plans.first.id : null);

          final selected = plans.where((p) => p.id == _selectedPlan).firstOrNull;
          final total = selected?.price ?? 0;

          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: ThumbnailImage(
                  url: course.thumbnail,
                  videoUrl: course.previewVideoUrl,
                  borderRadius: 0,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                course.title,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              Text(
                'Unlock all ${course.videoCount} videos in this course only.',
                style: const TextStyle(color: AppColors.textSecondary, height: 1.4),
              ),
              const SizedBox(height: 24),
              const Text(
                'Choose a plan',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 12),
              ...plans.map((plan) {
                final isSelected = _selectedPlan == plan.id;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: InkWell(
                    onTap: () => setState(() => _selectedPlan = plan.id),
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primaryLight : AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : AppColors.border,
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isSelected
                                ? Icons.radio_button_checked
                                : Icons.radio_button_off,
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.textSecondary,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      plan.title,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 15,
                                      ),
                                    ),
                                    if (plan.badge != null) ...[
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 2,
                                        ),
                                        decoration: BoxDecoration(
                                          color: AppColors.primary,
                                          borderRadius: BorderRadius.circular(99),
                                        ),
                                        child: Text(
                                          plan.badge!,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 10,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  plan.subtitle,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${plan.currency} ${plan.price.toStringAsFixed(0)}',
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    _CheckoutRow(label: 'Course', value: course.title),
                    const SizedBox(height: 8),
                    _CheckoutRow(
                      label: 'Access',
                      value: 'This course only',
                    ),
                    const Divider(height: 24),
                    _CheckoutRow(
                      label: 'Total',
                      value: selected == null
                          ? '—'
                          : '${selected.currency} ${total.toStringAsFixed(0)}',
                      bold: true,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              FilledButton(
                onPressed: _submitting || selected == null
                    ? null
                    : () => _completePurchase(course),
                child: _submitting
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : Text(
                        'Pay with PayU • ${selected?.currency ?? ''} ${total.toStringAsFixed(0)}',
                      ),
              ),
              const SizedBox(height: 10),
              Text(
                'Secure payment powered by PayU.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _PlanOption {
  const _PlanOption({
    required this.id,
    required this.title,
    required this.price,
    required this.currency,
    required this.subtitle,
    this.badge,
  });

  final String id;
  final String title;
  final double price;
  final String currency;
  final String subtitle;
  final String? badge;
}

class _CheckoutRow extends StatelessWidget {
  const _CheckoutRow({
    required this.label,
    required this.value,
    this.bold = false,
  });

  final String label;
  final String value;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              color: AppColors.textSecondary,
              fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
            ),
          ),
        ),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: TextStyle(
              fontWeight: bold ? FontWeight.w800 : FontWeight.w600,
              fontSize: bold ? 18 : 14,
            ),
          ),
        ),
      ],
    );
  }
}
