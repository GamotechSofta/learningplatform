import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
import '../models/certificate.dart';

class CertificateCard extends StatelessWidget {
  const CertificateCard({
    super.key,
    required this.certificate,
    this.compact = false,
  });

  final CourseCertificate certificate;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final dateText = DateFormat('MMMM d, yyyy').format(certificate.issuedAt);

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(compact ? 20 : 28),
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.accentGold, width: 2),
        boxShadow: [
          BoxShadow(color: c.cardShadow,
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(width: 48, height: 1.5, color: AppColors.accentGold),
              const SizedBox(width: 12),
              const Icon(Icons.workspace_premium_rounded, color: AppColors.accentGold, size: 28),
              const SizedBox(width: 12),
              Container(width: 48, height: 1.5, color: AppColors.accentGold),
            ],
          ),
          SizedBox(height: 16),
          Text(
            certificate.organization.toUpperCase(),
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w800,
              letterSpacing: 2.4,
              color: AppColors.primary,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Certificate of Completion',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: c.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 18),
          Text(
            'This is to certify that',
            style: TextStyle(fontSize: 14, color: c.textSecondary),
          ),
          SizedBox(height: 10),
          Text(
            certificate.studentName,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              color: c.textPrimary,
              fontStyle: FontStyle.italic,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 14),
          Text(
            'has successfully completed the course',
            style: TextStyle(fontSize: 14, color: c.textSecondary),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 10),
          Text(
            certificate.courseTitle,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
            ),
            textAlign: TextAlign.center,
          ),
          if (certificate.instructorName != null) ...[
            SizedBox(height: 12),
            Text(
              'Instructor: ${certificate.instructorName}',
              style: TextStyle(fontSize: 13, color: c.textSecondary),
            ),
          ],
          SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Date of completion',
                      style: TextStyle(fontSize: 11, color: c.textSecondary),
                    ),
                    SizedBox(height: 4),
                    Text(
                      dateText,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: c.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Certificate ID',
                      style: TextStyle(fontSize: 11, color: c.textSecondary),
                    ),
                    SizedBox(height: 4),
                    Text(
                      certificate.certificateNumber,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: c.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _SignatureBlock(label: 'Authorized Signatory', name: certificate.organization),
              Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.accentGold, width: 2),
                      color: c.primaryTint,
                    ),
                    child: Icon(Icons.verified_rounded, color: AppColors.primary, size: 34),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Official Seal',
                    style: TextStyle(fontSize: 11, color: c.textSecondary),
                  ),
                ],
              ),
              _SignatureBlock(label: 'Program Director', name: 'Academic Board'),
            ],
          ),
        ],
      ),
    );
  }
}

class _SignatureBlock extends StatelessWidget {
  const _SignatureBlock({required this.label, required this.name});

  final String label;
  final String name;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return SizedBox(
      width: 110,
      child: Column(
        children: [
          Container(
            width: double.infinity,
            height: 1,
            color: c.borderLight,
          ),
          SizedBox(height: 8),
          Text(
            name,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
          ),
          SizedBox(height: 2),
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 10, color: c.textSecondary),
          ),
        ],
      ),
    );
  }
}
