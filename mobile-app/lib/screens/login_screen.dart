import 'package:flutter/material.dart';
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

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _submitting = false;
  bool _obscure = true;
  bool _rememberMe = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
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
      await auth.login(
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
              'Welcome back, ${auth.user?.name.split(' ').first ?? 'Learner'}! 🎓',
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
      title: 'Welcome ',
      titleHighlight: 'Back!',
      subtitle:
          'Good to see you again. Jump back into your courses, track your progress, and keep moving forward.',
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
                child: Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
              ),
              SizedBox(height: 16),
            ],
            AuthTextField(
              controller: _emailController,
              label: 'Email Address',
              keyboardType: TextInputType.emailAddress,
              highlightBorder: true,
              validator: (value) =>
                  value == null || value.trim().isEmpty ? 'Email is required' : null,
            ),
            SizedBox(height: 18),
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
            SizedBox(height: 14),
            Row(
              children: [
                SizedBox(
                  width: 22,
                  height: 22,
                  child: Checkbox(
                    value: _rememberMe,
                    onChanged: (value) => setState(() => _rememberMe = value ?? false),
                    activeColor: AppColors.authBlue,
                    side: BorderSide(color: c.border),
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
                SizedBox(width: 8),
                Text(
                  'Remember Me',
                  style: TextStyle(fontSize: 13, color: c.textSecondary),
                ),
                const Spacer(),
                TextButton(
                  onPressed: () {},
                  style: TextButton.styleFrom(
                    foregroundColor: c.textSecondary,
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text('Forgot Password?', style: TextStyle(fontSize: 13)),
                ),
              ],
            ),
            const SizedBox(height: 24),
            AuthPrimaryButton(
              label: 'Log in',
              loading: _submitting,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}
