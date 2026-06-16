import 'package:flutter/material.dart';

import 'vidyank_colors.dart';

export 'vidyank_colors.dart';

extension ThemedColors on BuildContext {
  bool get isDarkTheme => Theme.of(this).brightness == Brightness.dark;

  VidyankColors get colors => VidyankColors.of(this);

  Color get themedBackground => colors.background;

  Color get themedSurface => colors.surface;

  Color get themedSurfaceElevated => colors.surfaceElevated;

  Color get themedBorder => colors.border;

  Color get themedTextPrimary => colors.textPrimary;

  Color get themedTextSecondary => colors.textSecondary;

  Color get themedInputFill => colors.inputFill;

  Color get themedPrimaryTint => colors.primaryTint;
}
