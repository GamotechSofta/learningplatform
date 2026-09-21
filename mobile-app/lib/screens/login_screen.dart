import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../core/utils/api_errors.dart';
import '../core/utils/post_auth_sync.dart';
import '../core/utils/resume_learning_flow.dart';
import '../providers/auth_provider.dart';
import '../providers/learning_progress_provider.dart';
import '../providers/notification_provider.dart';
import '../providers/saved_courses_provider.dart';
import '../providers/subscription_provider.dart';
import '../providers/video_engagement_provider.dart';
import '../widgets/auth/auth_screen_layout.dart';
import '../widgets/auth/auth_text_field.dart';

enum _LoginStep { phone, otp }

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  _LoginStep _step = _LoginStep.phone;
  bool _submitting = false;
  String? _error;
  String _phone = '';

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  String _normalizePhone(String value) {
    final digits = value.replaceAll(RegExp(r'\D'), '');
    if (digits.length >= 10) return digits.substring(digits.length - 10);
    return digits;
  }

  Future<void> _sendOtp() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final phone = _normalizePhone(_phoneController.text);
      final result = await context.read<AuthProvider>().sendLoginOtp(phone);
      if (!mounted) return;
      setState(() {
        _phone = result.phone;
        _step = _LoginStep.otp;
        _otpController.clear();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('OTP sent to +91 $phone')),
      );
    } catch (error) {
      setState(() => _error = ApiErrors.friendlyMessage(error));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _verifyOtp() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final auth = context.read<AuthProvider>();
      final subs = context.read<SubscriptionProvider>();
      final progress = context.read<LearningProgressProvider>();
      final notifications = context.read<NotificationProvider>();
      final saved = context.read<SavedCoursesProvider>();
      final engagement = context.read<VideoEngagementProvider>();

      await auth.verifyLoginOtp(_phone, _otpController.text.trim());

      await syncUserDataAfterAuth(
        auth: auth,
        subs: subs,
        progress: progress,
        notifications: notifications,
        saved: saved,
        engagement: engagement,
      );

      final continueCourse = progress.pickContinueCourse(
        subs.activeSubscriptions.map((sub) => sub.course).toList(),
      );
      if (continueCourse != null) {
        ResumePrompt.markPending();
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Welcome back, ${auth.user?.name.split(' ').first ?? 'Learner'}!',
            ),
          ),
        );
        context.go(auth.needsLearningTrack ? '/onboarding/learning-track' : '/');
      }
    } catch (error) {
      setState(() => _error = ApiErrors.friendlyMessage(error));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isOtp = _step == _LoginStep.otp;

    return AuthScreenLayout(
      title: 'Welcome ',
      titleHighlight: 'Back!',
      subtitle: isOtp
          ? 'Enter the OTP sent to +91 $_phone to continue learning.'
          : 'Sign in with your mobile number. We’ll send a one-time password.',
      footerText: "Don't have an account? ",
      footerAction: 'Sign Up',
      onFooterTap: () => context.push('/register'),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_error != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.error.withValues(alpha: 0.35)),
                ),
                child: Text(
                  _error!,
                  style: const TextStyle(color: AppColors.error, fontSize: 13),
                ),
              ),
              const SizedBox(height: 16),
            ],
            if (!isOtp)
              AuthTextField(
                controller: _phoneController,
                label: 'Mobile Number',
                keyboardType: TextInputType.phone,
                highlightBorder: true,
                maxLength: 10,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                validator: (value) {
                  final phone = _normalizePhone(value ?? '');
                  if (phone.length != 10) {
                    return 'Enter a valid 10-digit mobile number';
                  }
                  if (!RegExp(r'^[6-9]').hasMatch(phone)) {
                    return 'Enter a valid Indian mobile number';
                  }
                  return null;
                },
              )
            else ...[
              AuthTextField(
                controller: _otpController,
                label: 'OTP',
                keyboardType: TextInputType.number,
                highlightBorder: true,
                maxLength: 6,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                validator: (value) {
                  if (value == null || value.trim().length < 4) {
                    return 'Enter the OTP';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton(
                  onPressed: _submitting
                      ? null
                      : () => setState(() {
                            _step = _LoginStep.phone;
                            _error = null;
                            _otpController.clear();
                          }),
                  child: const Text('Change number'),
                ),
              ),
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton(
                  onPressed: _submitting ? null : _sendOtp,
                  child: const Text('Resend OTP'),
                ),
              ),
            ],
            const SizedBox(height: 24),
            AuthPrimaryButton(
              label: isOtp ? 'Verify & Log in' : 'Get OTP',
              loading: _submitting,
              onPressed: isOtp ? _verifyOtp : _sendOtp,
            ),
          ],
        ),
      ),
    );
  }
}
