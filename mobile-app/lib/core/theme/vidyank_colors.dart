import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Semantic colors that adapt to light/dark mode.
@immutable
class VidyankColors extends ThemeExtension<VidyankColors> {
  const VidyankColors({
    required this.background,
    required this.surface,
    required this.surfaceElevated,
    required this.border,
    required this.borderLight,
    required this.textPrimary,
    required this.textSecondary,
    required this.inputFill,
    required this.primaryTint,
    required this.primaryTintBorder,
    required this.placeholder,
    required this.cardShadow,
    required this.glowShadow,
  });

  final Color background;
  final Color surface;
  final Color surfaceElevated;
  final Color border;
  final Color borderLight;
  final Color textPrimary;
  final Color textSecondary;
  final Color inputFill;
  final Color primaryTint;
  final Color primaryTintBorder;
  final Color placeholder;
  final Color cardShadow;
  final Color glowShadow;

  static const light = VidyankColors(
    background: AppColors.background,
    surface: AppColors.surface,
    surfaceElevated: AppColors.surface,
    border: AppColors.border,
    borderLight: AppColors.borderLight,
    textPrimary: AppColors.textPrimary,
    textSecondary: AppColors.textSecondary,
    inputFill: AppColors.inputFill,
    primaryTint: AppColors.primaryLight,
    primaryTintBorder: Color(0xFFD1FAE5),
    placeholder: AppColors.placeholder,
    cardShadow: Color(0x0A000000),
    glowShadow: Color(0x1400BF63),
  );

  static const dark = VidyankColors(
    background: Color(0xFF0B1120),
    surface: Color(0xFF151D2E),
    surfaceElevated: Color(0xFF1C2738),
    border: Color(0xFF2A3548),
    borderLight: Color(0xFF222D40),
    textPrimary: Color(0xFFE8EDF5),
    textSecondary: Color(0xFF8B9BB5),
    inputFill: Color(0xFF1A2332),
    primaryTint: Color(0xFF0F2D22),
    primaryTintBorder: Color(0xFF1A4D38),
    placeholder: Color(0xFF243044),
    cardShadow: Color(0x66000000),
    glowShadow: Color(0x3300BF63),
  );

  static VidyankColors of(BuildContext context) {
    final extension = Theme.of(context).extension<VidyankColors>();
    if (extension != null) return extension;
    return Theme.of(context).brightness == Brightness.dark ? dark : light;
  }

  @override
  VidyankColors copyWith({
    Color? background,
    Color? surface,
    Color? surfaceElevated,
    Color? border,
    Color? borderLight,
    Color? textPrimary,
    Color? textSecondary,
    Color? inputFill,
    Color? primaryTint,
    Color? primaryTintBorder,
    Color? placeholder,
    Color? cardShadow,
    Color? glowShadow,
  }) {
    return VidyankColors(
      background: background ?? this.background,
      surface: surface ?? this.surface,
      surfaceElevated: surfaceElevated ?? this.surfaceElevated,
      border: border ?? this.border,
      borderLight: borderLight ?? this.borderLight,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      inputFill: inputFill ?? this.inputFill,
      primaryTint: primaryTint ?? this.primaryTint,
      primaryTintBorder: primaryTintBorder ?? this.primaryTintBorder,
      placeholder: placeholder ?? this.placeholder,
      cardShadow: cardShadow ?? this.cardShadow,
      glowShadow: glowShadow ?? this.glowShadow,
    );
  }

  @override
  VidyankColors lerp(ThemeExtension<VidyankColors>? other, double t) {
    if (other is! VidyankColors) return this;
    return VidyankColors(
      background: Color.lerp(background, other.background, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceElevated: Color.lerp(surfaceElevated, other.surfaceElevated, t)!,
      border: Color.lerp(border, other.border, t)!,
      borderLight: Color.lerp(borderLight, other.borderLight, t)!,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      inputFill: Color.lerp(inputFill, other.inputFill, t)!,
      primaryTint: Color.lerp(primaryTint, other.primaryTint, t)!,
      primaryTintBorder: Color.lerp(primaryTintBorder, other.primaryTintBorder, t)!,
      placeholder: Color.lerp(placeholder, other.placeholder, t)!,
      cardShadow: Color.lerp(cardShadow, other.cardShadow, t)!,
      glowShadow: Color.lerp(glowShadow, other.glowShadow, t)!,
    );
  }
}
