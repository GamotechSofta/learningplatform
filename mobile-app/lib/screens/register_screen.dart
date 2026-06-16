import 'package:flutter/material.dart';
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

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _submitting = false;
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  String? _error;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
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

      await auth.register(
        _nameController.text.trim(),
        _emailController.text.trim(),
        _passwordController.text,
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
              'Welcome aboard, ${_nameController.text.trim().split(' ').first}! Let\'s start learning.',
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
    final c = context.colors;
    return AuthScreenLayout(
      title: 'Join ',
      titleHighlight: 'Vidyank',
      subtitle:
          'Your learning adventure starts here. Unlock premium courses, earn certificates, and grow at your own pace.',
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
                child: Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
              ),
              const SizedBox(height: 16),
            ],
            AuthTextField(
              controller: _nameController,
              label: 'Full Name',
              highlightBorder: true,
              validator: (value) =>
                  value == null || value.trim().isEmpty ? 'Name is required' : null,
            ),
            SizedBox(height: 18),
            AuthTextField(
              controller: _emailController,
              label: 'Email Address',
              keyboardType: TextInputType.emailAddress,
              validator: (value) =>
                  value == null || value.trim().isEmpty ? 'Email is required' : null,
            ),
            SizedBox(height: 18),
            AuthTextField(
              controller: _passwordController,
              label: 'Password',
              obscureText: _obscurePassword,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                  color: c.textSecondary,
                ),
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
              validator: (value) => value == null || value.length < 6
                  ? 'Password must be at least 6 characters'
                  : null,
            ),
            SizedBox(height: 18),
            AuthTextField(
              controller: _confirmController,
              label: 'Confirm Password',
              obscureText: _obscureConfirm,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureConfirm ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                  color: c.textSecondary,
                ),
                onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) return 'Please confirm your password';
                if (value != _passwordController.text) return 'Passwords do not match';
                return null;
              },
            ),
            const SizedBox(height: 28),
            AuthPrimaryButton(
              label: 'Sign Up',
              loading: _submitting,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}
