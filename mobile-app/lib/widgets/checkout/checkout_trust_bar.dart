import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/themed_colors.dart';

class CheckoutTrustBar extends StatelessWidget {
  const CheckoutTrustBar({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: c.primaryTint.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
      ),
      child: const Row(
        children: [
          Expanded(child: _TrustItem(icon: Icons.lock_rounded, label: 'Secure PayU')),
          Expanded(child: _TrustItem(icon: Icons.bolt_rounded, label: 'Instant access')),
          Expanded(child: _TrustItem(icon: Icons.workspace_premium_outlined, label: 'Certificate')),
        ],
      ),
    );
  }
}

class _TrustItem extends StatelessWidget {
  const _TrustItem({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, size: 20, color: AppColors.primary),
        const SizedBox(height: 4),
        Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
        ),
      ],
    );
  }
}
