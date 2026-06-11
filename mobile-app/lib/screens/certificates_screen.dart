import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../widgets/empty_state.dart';

class CertificatesScreen extends StatelessWidget {
  const CertificatesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: EmptyState(
          title: auth.isAuthenticated ? 'No certificates yet' : 'Sign in to view certificates',
          subtitle: auth.isAuthenticated
              ? 'Complete courses to earn certificates.'
              : 'Login to see your earned certificates.',
          icon: Icons.workspace_premium_outlined,
        ),
      ),
    );
  }
}
