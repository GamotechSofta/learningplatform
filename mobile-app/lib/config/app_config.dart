import 'dart:io';

import 'package:flutter/foundation.dart';

class AppConfig {
  AppConfig._();

  /// Override: flutter run --dart-define=API_BASE_URL=http://192.168.1.37:3000
  static const String _apiOverride = String.fromEnvironment('API_BASE_URL');

  /// Your PC's LAN IP — update if your network changes (for local backend on a physical phone).
  static const String devLanIp = '192.168.1.37';

  static const String productionApi = 'https://api.vidyank.com';

  static String get apiBaseUrl {
    if (_apiOverride.isNotEmpty) return _apiOverride;

    // Physical Android phones cannot use 10.0.2.2 (emulator-only).
    // Default to production so the app works on USB devices out of the box.
    if (!kIsWeb && Platform.isAndroid) {
      return productionApi;
    }

    if (kIsWeb) return productionApi;

    // iOS simulator / desktop local dev
    return 'http://localhost:3000';
  }

  static const String appName = 'Vidyank';
}
