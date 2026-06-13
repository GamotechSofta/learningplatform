import 'package:flutter/material.dart';

import 'package:flutter/services.dart';



import 'app_colors.dart';



class AppTheme {

  AppTheme._();



  static ThemeData get light {

    const colorScheme = ColorScheme.light(

      brightness: Brightness.light,

      primary: AppColors.primary,

      onPrimary: Colors.white,

      secondary: AppColors.accentGreen,

      onSecondary: Colors.white,

      surface: AppColors.surface,

      onSurface: AppColors.textPrimary,

      error: AppColors.error,

      onError: Colors.white,

    );



    return ThemeData(

      useMaterial3: true,

      brightness: Brightness.light,

      colorScheme: colorScheme,

      scaffoldBackgroundColor: AppColors.background,

      canvasColor: AppColors.background,

      dividerColor: AppColors.border,

      appBarTheme: const AppBarTheme(

        centerTitle: false,

        elevation: 0,

        scrolledUnderElevation: 0,

        backgroundColor: AppColors.background,

        foregroundColor: AppColors.textPrimary,

        systemOverlayStyle: SystemUiOverlayStyle(

          statusBarColor: Colors.transparent,

          statusBarIconBrightness: Brightness.dark,

          statusBarBrightness: Brightness.light,

        ),

      ),

      cardTheme: CardThemeData(

        elevation: 0,

        color: AppColors.surface,

        shape: RoundedRectangleBorder(

          borderRadius: BorderRadius.circular(12),

          side: const BorderSide(color: AppColors.border),

        ),

      ),

      inputDecorationTheme: InputDecorationTheme(

        filled: true,

        fillColor: AppColors.inputFill,

        hintStyle: const TextStyle(color: AppColors.textSecondary),

        labelStyle: const TextStyle(color: AppColors.textSecondary),

        border: OutlineInputBorder(

          borderRadius: BorderRadius.circular(12),

          borderSide: const BorderSide(color: AppColors.border),

        ),

        enabledBorder: OutlineInputBorder(

          borderRadius: BorderRadius.circular(12),

          borderSide: const BorderSide(color: AppColors.border),

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

          minimumSize: const Size.fromHeight(48),

          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),

        ),

      ),

      outlinedButtonTheme: OutlinedButtonThemeData(

        style: OutlinedButton.styleFrom(

          foregroundColor: AppColors.primary,

          side: const BorderSide(color: AppColors.primary),

          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),

        ),

      ),

      textButtonTheme: TextButtonThemeData(

        style: TextButton.styleFrom(foregroundColor: AppColors.primary),

      ),

      progressIndicatorTheme: const ProgressIndicatorThemeData(

        color: AppColors.primary,

      ),

      bottomNavigationBarTheme: const BottomNavigationBarThemeData(

        backgroundColor: AppColors.surface,

        selectedItemColor: AppColors.primary,

        unselectedItemColor: AppColors.textSecondary,

        type: BottomNavigationBarType.fixed,

        elevation: 8,

      ),

      drawerTheme: const DrawerThemeData(

        backgroundColor: AppColors.surface,

      ),

      listTileTheme: const ListTileThemeData(

        iconColor: AppColors.textSecondary,

        textColor: AppColors.textPrimary,

      ),

      iconTheme: const IconThemeData(color: AppColors.textPrimary),

      textTheme: const TextTheme(

        bodyLarge: TextStyle(color: AppColors.textPrimary),

        bodyMedium: TextStyle(color: AppColors.textPrimary),

        bodySmall: TextStyle(color: AppColors.textSecondary),

        titleLarge: TextStyle(color: AppColors.textPrimary),

        titleMedium: TextStyle(color: AppColors.textPrimary),

        titleSmall: TextStyle(color: AppColors.textPrimary),

        labelLarge: TextStyle(color: AppColors.textPrimary),

      ),

    );

  }

}


