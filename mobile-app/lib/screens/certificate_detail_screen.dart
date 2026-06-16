import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/theme/themed_colors.dart';
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
    final c = context.colors;
    final progress = context.watch<LearningProgressProvider>();
    final certificate = progress.certificates
        .where((cert) => cert.id == certificateId)
        .firstOrNull;

    return Scaffold(
      backgroundColor: c.background,
      appBar: AppBar(
        backgroundColor: c.background,
        title: Text('Certificate'),
      ),
      body: certificate == null
          ? Center(child: Text('Certificate not found'))
          : ListView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
              children: [
                CertificateCard(certificate: certificate),
                SizedBox(height: 16),
                Text(
                  'Congratulations on completing ${certificate.courseTitle}!',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: c.textSecondary, height: 1.5),
                ),
              ],
            ),
    );
  }
}
