import '../core/api/api_client.dart';
import '../models/user.dart';

class AuthService {
  AuthService(this._api);

  final ApiClient _api;

  Future<User> login({required String email, required String password}) async {
    final user = await _api.postData(
      '/api/auth/login',
      body: {'email': email, 'password': password},
      parser: (data) => User.fromJson(Map<String, dynamic>.from(data as Map)),
    );

    if (user.token != null && user.token!.isNotEmpty) {
      await _api.saveToken(user.token!);
    }

    return user;
  }

  Future<User> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final user = await _api.postData(
      '/api/users/register',
      body: {'name': name, 'email': email, 'password': password},
      parser: (data) => User.fromJson(Map<String, dynamic>.from(data as Map)),
    );

    if (user.token != null && user.token!.isNotEmpty) {
      await _api.saveToken(user.token!);
    }

    return user;
  }

  Future<User?> getMe() async {
    try {
      return await _api.getData(
        '/api/auth/me',
        parser: (data) => User.fromJson(Map<String, dynamic>.from(data as Map)),
      );
    } catch (_) {
      await _api.clearToken();
      return null;
    }
  }

  Future<void> logout() async {
    try {
      await _api.dio.post('/api/auth/logout');
    } finally {
      await _api.clearToken();
    }
  }
}
