import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
import '../models/certificate.dart';
import '../providers/auth_provider.dart';
import '../providers/learning_progress_provider.dart';
import '../widgets/empty_state.dart';
import '../widgets/page_app_bar.dart';

class CertificatesScreen extends StatelessWidget {
  const CertificatesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final auth = context.watch<AuthProvider>();
    final progress = context.watch<LearningProgressProvider>();

    if (!auth.isAuthenticated) {
      return Scaffold(
        backgroundColor: c.background,
        body: SafeArea(
          child: EmptyState(
            title: 'Sign in to view certificates',
            subtitle: 'Complete purchased courses to earn certificates.',
            icon: Icons.workspace_premium_outlined,
          ),
        ),
      );
    }

    final certificates = progress.certificates;

    return Scaffold(
      backgroundColor: c.background,
      appBar: PageAppBar(
        backgroundColor: c.background,
        title: const Text('My Certificates'),
      ),
      body: certificates.isEmpty
          ? const EmptyState(
              title: 'No certificates yet',
              subtitle: 'Finish all videos in a purchased course to earn your certificate.',
              icon: Icons.workspace_premium_outlined,
            )
          : ListView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
              children: [
                Text(
                  '${certificates.length} earned',
                  style: TextStyle(color: c.textSecondary),
                ),
                const SizedBox(height: 16),
                ...certificates.map(
                  (certificate) => _CertificateListItem(certificate: certificate),
                ),
              ],
            ),
    );
  }
}

class _CertificateListItem extends StatelessWidget {
  const _CertificateListItem({required this.certificate});

  final CourseCertificate certificate;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final dateText = DateFormat('MMM d, yyyy').format(certificate.issuedAt);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => context.push('/certificates/${certificate.id}'),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: c.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: c.border),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.accentGold.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.emoji_events_rounded,
                  color: AppColors.accentGold,
                  size: 28,
                ),
              ),
              SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      certificate.courseTitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: c.textPrimary,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Certificate of Completion',
                      style: TextStyle(fontSize: 12, color: c.textSecondary),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Completed on $dateText',
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.accentGreen,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => context.push('/certificates/${certificate.id}'),
                icon: const Icon(Icons.download_rounded, color: AppColors.primary),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
