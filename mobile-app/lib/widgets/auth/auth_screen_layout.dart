import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/themed_colors.dart';
import '../app_logo.dart';
import '../page_app_bar.dart';
class AuthScreenLayout extends StatelessWidget {
  const AuthScreenLayout({
    super.key,
    required this.title,
    required this.titleHighlight,
    required this.subtitle,
    required this.child,
    required this.footerText,
    required this.footerAction,
    required this.onFooterTap,
  });

  final String title;
  final String titleHighlight;
  final String subtitle;
  final Widget child;
  final String footerText;
  final String footerAction;
  final VoidCallback onFooterTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Scaffold(
      backgroundColor: c.background,
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            _AuthHeader(),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    Transform.translate(
                      offset: const Offset(0, -20),
                      child: Container(
                        width: double.infinity,
                        margin: const EdgeInsets.symmetric(horizontal: 0),
                        padding: const EdgeInsets.fromLTRB(28, 32, 28, 24),
                        decoration: BoxDecoration(
                          color: c.surface,
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
                          border: Border.all(color: c.border),
                          boxShadow: [
                            BoxShadow(
                              color: c.glowShadow,
                              blurRadius: 24,
                              offset: const Offset(0, -4),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            AuthWelcomeTitle(
                              title: title,
                              highlight: titleHighlight,
                            ),
                            SizedBox(height: 12),
                            Text(
                              subtitle,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 14,
                                color: c.textSecondary,
                                height: 1.55,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            SizedBox(height: 28),
                            child,
                          ],
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            footerText,
                            style: TextStyle(
                              color: c.textSecondary,
                              fontSize: 14,
                            ),
                          ),
                          GestureDetector(
                            onTap: onFooterTap,
                            child: Text(
                              footerAction,
                              style: const TextStyle(
                                color: AppColors.authBlue,
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AuthHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final height = MediaQuery.of(context).size.height * 0.22;

    return Container(
      height: height.clamp(150.0, 190.0),
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.authBlue, AppColors.authBlueDark],
        ),
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Positioned(
            right: -24,
            top: 8,
            child: Icon(
              Icons.school_rounded,
              size: 90,
              color: Colors.white.withValues(alpha: 0.08),
            ),
          ),
          Positioned(
            left: -16,
            bottom: 16,
            child: Icon(
              Icons.menu_book_rounded,
              size: 64,
              color: Colors.white.withValues(alpha: 0.08),
            ),
          ),
          SafeArea(
            child: Align(
              alignment: Alignment.topLeft,
              child: PageBackButton(
                color: Colors.white,
                onPressed: () => navigateBack(context),
              ),
            ),
          ),
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 20),
                const AppLogo(height: 72),
                const SizedBox(height: 8),
                Text(
                  'Learn • Grow • Succeed',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Colors.white.withValues(alpha: 0.9),
                    letterSpacing: 0.8,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Two-tone welcome headline using brand greens.
class AuthWelcomeTitle extends StatelessWidget {
  const AuthWelcomeTitle({
    super.key,
    required this.title,
    required this.highlight,
  });

  final String title;
  final String highlight;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Column(
      children: [
        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              height: 1.15,
              letterSpacing: 0.3,
            ),
            children: [
              TextSpan(
                text: title,
                style: TextStyle(
                  color: context.isDarkTheme
                      ? c.textPrimary
                      : AppColors.authBlue,
                ),
              ),
              TextSpan(
                text: highlight,
                style: const TextStyle(color: AppColors.primary),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        Container(
          width: 48,
          height: 3,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.authBlue, AppColors.primaryDark],
            ),
            borderRadius: BorderRadius.circular(99),
          ),
        ),
      ],
    );
  }
}

/// Primary pill-shaped auth button.
class AuthPrimaryButton extends StatelessWidget {
  const AuthPrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.loading = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: ElevatedButton(
        onPressed: loading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
        ),
        child: loading
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              )
            : Text(label),
      ),
    );
  }
}

/// "Login With" style divider.
class AuthDivider extends StatelessWidget {
  const AuthDivider({super.key, this.label = 'Login With'});

  final String label;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Row(
      children: [
        Expanded(child: Divider(color: c.border)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            label,
            style: TextStyle(
              color: c.textSecondary,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        Expanded(child: Divider(color: c.border)),
      ],
    );
  }
}
