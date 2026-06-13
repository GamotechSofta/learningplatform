class AppConfig {
  AppConfig._();

  /// Override for local dev: flutter run --dart-define=API_BASE_URL=http://192.168.1.37:3000
  static const String _apiOverride = String.fromEnvironment('API_BASE_URL');

  static const String productionApi = 'https://api.vidyank.com';

  static String get apiBaseUrl =>
      _apiOverride.isNotEmpty ? _apiOverride : productionApi;

  static const String appName = 'Vidyank';
}
