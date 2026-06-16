import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';
import 'vidyank_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get light => _build(Brightness.light);

  static ThemeData get dark => _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    final vc = isDark ? VidyankColors.dark : VidyankColors.light;

    final textTheme = GoogleFonts.plusJakartaSansTextTheme(
      ThemeData(brightness: brightness).textTheme,
    ).apply(
      bodyColor: vc.textPrimary,
      displayColor: vc.textPrimary,
    );

    final colorScheme = ColorScheme(
      brightness: brightness,
      primary: AppColors.primary,
      onPrimary: Colors.white,
      secondary: AppColors.accentGreen,
      onSecondary: Colors.white,
      error: AppColors.error,
      onError: Colors.white,
      surface: vc.surface,
      onSurface: vc.textPrimary,
      surfaceContainerHighest: vc.surfaceElevated,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: vc.background,
      canvasColor: vc.background,
      dividerColor: vc.border,
      textTheme: textTheme,
      extensions: [vc],
      appBarTheme: AppBarTheme(
        centerTitle: false,
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: vc.background,
        foregroundColor: vc.textPrimary,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: textTheme.titleLarge?.copyWith(
          fontWeight: FontWeight.w800,
          color: vc.textPrimary,
        ),
        systemOverlayStyle: isDark
            ? const SystemUiOverlayStyle(
                statusBarColor: Colors.transparent,
                statusBarIconBrightness: Brightness.light,
                statusBarBrightness: Brightness.dark,
              )
            : const SystemUiOverlayStyle(
                statusBarColor: Colors.transparent,
                statusBarIconBrightness: Brightness.dark,
                statusBarBrightness: Brightness.light,
              ),
      ),
      cardTheme: CardThemeData(
        elevation: isDark ? 0 : 0,
        color: vc.surface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: vc.border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: vc.inputFill,
        hintStyle: TextStyle(color: vc.textSecondary),
        labelStyle: TextStyle(color: vc.textSecondary),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: vc.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: vc.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          shadowColor: Colors.transparent,
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          shadowColor: Colors.transparent,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          elevation: 0,
          shadowColor: Colors.transparent,
          side: const BorderSide(color: AppColors.primary),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          elevation: 0,
          shadowColor: Colors.transparent,
        ),
      ),
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(
          elevation: 0,
          shadowColor: Colors.transparent,
        ),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.primary,
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: vc.surface,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: vc.textSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: isDark ? 0 : 8,
      ),
      drawerTheme: DrawerThemeData(
        backgroundColor: vc.surface,
        surfaceTintColor: Colors.transparent,
      ),
      listTileTheme: ListTileThemeData(
        iconColor: vc.textSecondary,
        textColor: vc.textPrimary,
      ),
      iconTheme: IconThemeData(color: vc.textPrimary),
      dividerTheme: DividerThemeData(color: vc.border, thickness: 1),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: isDark ? vc.surfaceElevated : AppColors.textPrimary,
        contentTextStyle: TextStyle(color: isDark ? vc.textPrimary : Colors.white),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: vc.surface,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: textTheme.titleLarge?.copyWith(
          fontWeight: FontWeight.w800,
          color: vc.textPrimary,
        ),
        contentTextStyle: textTheme.bodyMedium?.copyWith(color: vc.textSecondary),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: vc.surface,
        surfaceTintColor: Colors.transparent,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: vc.primaryTint,
        labelStyle: TextStyle(color: vc.textPrimary, fontWeight: FontWeight.w600),
        side: BorderSide(color: vc.primaryTintBorder),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(99)),
      ),
      expansionTileTheme: ExpansionTileThemeData(
        backgroundColor: vc.surface,
        collapsedBackgroundColor: vc.surface,
        textColor: vc.textPrimary,
        collapsedTextColor: vc.textPrimary,
        iconColor: vc.textSecondary,
        collapsedIconColor: vc.textSecondary,
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return AppColors.primary;
          return isDark ? vc.textSecondary : Colors.white;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.primary.withValues(alpha: 0.45);
          }
          return isDark ? vc.border : vc.borderLight;
        }),
      ),
      popupMenuTheme: PopupMenuThemeData(
        color: vc.surfaceElevated,
        surfaceTintColor: Colors.transparent,
        textStyle: textTheme.bodyMedium?.copyWith(color: vc.textPrimary),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: vc.border),
        ),
      ),
      tooltipTheme: TooltipThemeData(
        decoration: BoxDecoration(
          color: isDark ? vc.surfaceElevated : vc.textPrimary,
          borderRadius: BorderRadius.circular(8),
          border: isDark ? Border.all(color: vc.border) : null,
        ),
        textStyle: TextStyle(
          color: isDark ? vc.textPrimary : Colors.white,
          fontSize: 12,
        ),
      ),
      scrollbarTheme: ScrollbarThemeData(
        thumbColor: WidgetStatePropertyAll(vc.border),
        radius: const Radius.circular(8),
      ),
    );
  }
}
