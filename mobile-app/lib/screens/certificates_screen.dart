import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../models/certificate.dart';
import '../providers/auth_provider.dart';
import '../providers/learning_progress_provider.dart';
import '../widgets/empty_state.dart';

class CertificatesScreen extends StatelessWidget {
  const CertificatesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final progress = context.watch<LearningProgressProvider>();

    if (!auth.isAuthenticated) {
      return const Scaffold(
        backgroundColor: AppColors.background,
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
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: certificates.isEmpty
            ? const EmptyState(
                title: 'No certificates yet',
                subtitle: 'Finish all videos in a purchased course to earn your certificate.',
                icon: Icons.workspace_premium_outlined,
              )
            : ListView(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
                children: [
                  const Text(
                    'My Certificates',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${certificates.length} earned',
                    style: const TextStyle(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 20),
                  ...certificates.map(
                    (certificate) => _CertificateListItem(certificate: certificate),
                  ),
                ],
              ),
      ),
    );
  }
}

class _CertificateListItem extends StatelessWidget {
  const _CertificateListItem({required this.certificate});

  final CourseCertificate certificate;

  @override
  Widget build(BuildContext context) {
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
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
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
                child: const Icon(
                  Icons.emoji_events_rounded,
                  color: AppColors.accentGold,
                  size: 28,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      certificate.courseTitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Certificate of Completion',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
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
