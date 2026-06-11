import 'package:flutter/foundation.dart';

import '../models/user.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider(this._authService);

  final AuthService _authService;

  User? _user;
  bool _loading = true;

  User? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get loading => _loading;

  Future<void> bootstrap() async {
    _loading = true;
    notifyListeners();

    try {
      _user = await _authService.getMe().timeout(const Duration(seconds: 8));
    } catch (_) {
      _user = null;
    }

    _loading = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _user = await _authService.login(email: email, password: password);
    notifyListeners();
  }

  Future<void> register(String name, String email, String password) async {
    _user = await _authService.register(
      name: name,
      email: email,
      password: password,
    );
    notifyListeners();
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    notifyListeners();
  }
}
