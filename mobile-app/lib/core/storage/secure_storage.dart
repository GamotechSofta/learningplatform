import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Shared secure storage tuned for release Android APK persistence.
FlutterSecureStorage createSecureStorage() {
  return const FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
      resetOnError: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    ),
  );
}
