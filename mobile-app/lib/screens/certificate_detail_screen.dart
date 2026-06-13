import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../providers/learning_progress_provider.dart';
import '../widgets/certificate_card.dart';

class CertificateDetailScreen extends StatelessWidget {
  const CertificateDetailScreen({
    super.key,
    required this.certificateId,
  });

  final String certificateId;

  @override
  Widget build(BuildContext context) {
    final progress = context.watch<LearningProgressProvider>();
    final certificate = progress.certificates
        .where((cert) => cert.id == certificateId)
        .firstOrNull;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        title: const Text('Certificate'),
      ),
      body: certificate == null
          ? const Center(child: Text('Certificate not found'))
          : ListView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
              children: [
                CertificateCard(certificate: certificate),
                const SizedBox(height: 16),
                Text(
                  'Congratulations on completing ${certificate.courseTitle}!',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textSecondary, height: 1.5),
                ),
              ],
            ),
    );
  }
}
