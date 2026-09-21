import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
import '../core/utils/api_errors.dart';
import '../core/utils/post_auth_sync.dart';
import '../providers/auth_provider.dart';
import '../providers/learning_progress_provider.dart';
import '../providers/notification_provider.dart';
import '../providers/saved_courses_provider.dart';
import '../providers/subscription_provider.dart';
import '../providers/video_engagement_provider.dart';
import '../widgets/auth/auth_screen_layout.dart';
import '../widgets/auth/auth_text_field.dart';

enum _SignupStep { details, otp, password }

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();

  _SignupStep _step = _SignupStep.details;
  bool _submitting = false;
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  String? _error;
  String? _signupToken;
  String _phone = '';

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _otpController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
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
      final result = await context.read<AuthProvider>().sendSignupOtp(
            name: _nameController.text.trim(),
            email: _emailController.text.trim(),
            phone: phone,
          );
      if (!mounted) return;
      setState(() {
        _phone = result.phone;
        _step = _SignupStep.otp;
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
      final result = await context.read<AuthProvider>().verifySignupOtp(
            _phone,
            _otpController.text.trim(),
          );
      if (!mounted) return;
      setState(() {
        _signupToken = result.signupToken;
        _step = _SignupStep.password;
      });
    } catch (error) {
      setState(() => _error = ApiErrors.friendlyMessage(error));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _completeSignup() async {
    if (!_formKey.currentState!.validate()) return;
    final token = _signupToken;
    if (token == null || token.isEmpty) {
      setState(() {
        _error = 'Signup session expired. Please verify OTP again.';
        _step = _SignupStep.details;
      });
      return;
    }

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

      await auth.completeSignup(
        signupToken: token,
        password: _passwordController.text,
        confirmPassword: _confirmController.text,
      );

      await syncUserDataAfterAuth(
        auth: auth,
        subs: subs,
        progress: progress,
        notifications: notifications,
        saved: saved,
        engagement: engagement,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Welcome aboard, ${_nameController.text.trim().split(' ').first}! Let’s start learning.',
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

  String get _subtitle {
    switch (_step) {
      case _SignupStep.details:
        return 'Enter your details. We’ll verify your mobile number with an OTP.';
      case _SignupStep.otp:
        return 'Enter the OTP sent to +91 $_phone.';
      case _SignupStep.password:
        return 'Create a password to finish setting up your account.';
    }
  }

  String get _buttonLabel {
    switch (_step) {
      case _SignupStep.details:
        return 'Get OTP';
      case _SignupStep.otp:
        return 'Verify OTP';
      case _SignupStep.password:
        return 'Sign Up';
    }
  }

  VoidCallback get _onPrimary {
    switch (_step) {
      case _SignupStep.details:
        return _sendOtp;
      case _SignupStep.otp:
        return _verifyOtp;
      case _SignupStep.password:
        return _completeSignup;
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;

    return AuthScreenLayout(
      title: 'Join ',
      titleHighlight: 'Vidyank',
      subtitle: _subtitle,
      footerText: 'Already have an account? ',
      footerAction: 'Log In',
      onFooterTap: () => context.pop(),
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
            if (_step == _SignupStep.details) ...[
              AuthTextField(
                controller: _nameController,
                label: 'Full Name',
                highlightBorder: true,
                validator: (value) =>
                    value == null || value.trim().isEmpty ? 'Name is required' : null,
              ),
              const SizedBox(height: 18),
              AuthTextField(
                controller: _emailController,
                label: 'Email Address',
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Email is required';
                  }
                  if (!value.contains('@')) return 'Enter a valid email';
                  return null;
                },
              ),
              const SizedBox(height: 18),
              AuthTextField(
                controller: _phoneController,
                label: 'Mobile Number',
                keyboardType: TextInputType.phone,
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
              ),
            ] else if (_step == _SignupStep.otp) ...[
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
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton(
                  onPressed: _submitting
                      ? null
                      : () => setState(() {
                            _step = _SignupStep.details;
                            _error = null;
                            _otpController.clear();
                          }),
                  child: const Text('Edit details'),
                ),
              ),
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton(
                  onPressed: _submitting ? null : _sendOtp,
                  child: const Text('Resend OTP'),
                ),
              ),
            ] else ...[
              AuthTextField(
                controller: _passwordController,
                label: 'Password',
                obscureText: _obscurePassword,
                highlightBorder: true,
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePassword
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: c.textSecondary,
                  ),
                  onPressed: () =>
                      setState(() => _obscurePassword = !_obscurePassword),
                ),
                validator: (value) => value == null || value.length < 6
                    ? 'Password must be at least 6 characters'
                    : null,
              ),
              const SizedBox(height: 18),
              AuthTextField(
                controller: _confirmController,
                label: 'Confirm Password',
                obscureText: _obscureConfirm,
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscureConfirm
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: c.textSecondary,
                  ),
                  onPressed: () =>
                      setState(() => _obscureConfirm = !_obscureConfirm),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please confirm your password';
                  }
                  if (value != _passwordController.text) {
                    return 'Passwords do not match';
                  }
                  return null;
                },
              ),
            ],
            const SizedBox(height: 28),
            AuthPrimaryButton(
              label: _buttonLabel,
              loading: _submitting,
              onPressed: _onPrimary,
            ),
          ],
        ),
      ),
    );
  }
}
