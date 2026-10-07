import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
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

enum _LoginMethod { email, phone }

enum _OtpStep { phone, otp }

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  _LoginMethod _method = _LoginMethod.email;
  _OtpStep _otpStep = _OtpStep.phone;
  bool _submitting = false;
  bool _obscure = true;
  String? _error;
  String _phone = '';

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  String _normalizePhone(String value) {
    final digits = value.replaceAll(RegExp(r'\D'), '');
    if (digits.length >= 10) return digits.substring(digits.length - 10);
    return digits;
  }

  void _switchMethod(_LoginMethod method) {
    if (_submitting || method == _method) return;
    setState(() {
      _method = method;
      _otpStep = _OtpStep.phone;
      _error = null;
      _otpController.clear();
    });
  }

  Future<void> _completeLogin(Future<void> Function(AuthProvider auth) signIn) async {
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

      await signIn(auth);

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

  Future<void> _loginWithEmail() => _completeLogin(
        (auth) => auth.login(
          _emailController.text.trim().toLowerCase(),
          _passwordController.text,
        ),
      );

  Future<void> _verifyOtp() => _completeLogin(
        (auth) => auth.verifyLoginOtp(_phone, _otpController.text.trim()),
      );

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
        _otpStep = _OtpStep.otp;
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

  String get _subtitle {
    if (_method == _LoginMethod.email) {
      return 'Good to see you again. Log in with your email and password.';
    }
    if (_otpStep == _OtpStep.otp) {
      return 'Enter the OTP sent to +91 $_phone to continue learning.';
    }
    return 'Log in with your mobile number. We’ll send a one-time password.';
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final isEmail = _method == _LoginMethod.email;
    final isOtpEntry = !isEmail && _otpStep == _OtpStep.otp;

    return AuthScreenLayout(
      title: 'Welcome ',
      titleHighlight: 'Back!',
      subtitle: _subtitle,
      footerText: "Don't have an account? ",
      footerAction: 'Sign Up',
      onFooterTap: () => context.push('/register'),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _LoginMethodToggle(
              method: _method,
              onChanged: _switchMethod,
            ),
            const SizedBox(height: 20),
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
            if (isEmail) ...[
              AuthTextField(
                controller: _emailController,
                label: 'Email Address',
                keyboardType: TextInputType.emailAddress,
                highlightBorder: true,
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
                controller: _passwordController,
                label: 'Password',
                obscureText: _obscure,
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    color: c.textSecondary,
                  ),
                  onPressed: () => setState(() => _obscure = !_obscure),
                ),
                validator: (value) =>
                    value == null || value.isEmpty ? 'Password is required' : null,
              ),
            ] else if (!isOtpEntry)
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: _submitting
                        ? null
                        : () => setState(() {
                              _otpStep = _OtpStep.phone;
                              _error = null;
                              _otpController.clear();
                            }),
                    child: const Text('Change number'),
                  ),
                  TextButton(
                    onPressed: _submitting ? null : _sendOtp,
                    child: const Text('Resend OTP'),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 24),
            AuthPrimaryButton(
              label: isEmail
                  ? 'Log in'
                  : isOtpEntry
                      ? 'Verify & Log in'
                      : 'Get OTP',
              loading: _submitting,
              onPressed: isEmail
                  ? _loginWithEmail
                  : isOtpEntry
                      ? _verifyOtp
                      : _sendOtp,
            ),
          ],
        ),
      ),
    );
  }
}

class _LoginMethodToggle extends StatelessWidget {
  const _LoginMethodToggle({required this.method, required this.onChanged});

  final _LoginMethod method;
  final ValueChanged<_LoginMethod> onChanged;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: c.inputFill,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: c.border),
      ),
      child: Row(
        children: [
          _option(context, _LoginMethod.email, 'Email', Icons.email_outlined),
          _option(context, _LoginMethod.phone, 'Phone OTP', Icons.phone_iphone),
        ],
      ),
    );
  }

  Widget _option(
    BuildContext context,
    _LoginMethod value,
    String label,
    IconData icon,
  ) {
    final c = context.colors;
    final selected = method == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => onChanged(value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: selected ? AppColors.authBlue : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 18,
                color: selected ? Colors.white : c.textSecondary,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: selected ? Colors.white : c.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
