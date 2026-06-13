import '../core/api/api_exception.dart';
import '../core/api/api_client.dart';
import '../models/user.dart';
import 'session_storage.dart';

class AuthService {
  AuthService(this._api, {SessionStorage? session})
      : _session = session ?? SessionStorage();

  final ApiClient _api;
  final SessionStorage _session;

  Future<User> login({required String email, required String password}) async {
    final user = await _api.postAuthData(
      '/api/auth/login',
      body: {'email': email, 'password': password},
      parser: (data, token) => User.fromJson(data).copyWith(token: token),
    );

    await _persistSession(user);
    return user;
  }

  Future<User> register({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      final user = await _api.postAuthData(
        '/api/users/register',
        body: {'name': name, 'email': email, 'password': password},
        parser: (data, token) => User.fromJson(data).copyWith(token: token),
      );
      await _persistSession(user);
      return user;
    } on ApiException catch (error) {
      // Legacy production API creates the account but omits token in JSON.
      if (error.message.contains('session token')) {
        return login(email: email, password: password);
      }
      rethrow;
    }
  }

  Future<User?> restoreSession() => _session.readSession();

  Future<User?> refreshSession() async {
    try {
      final user = await _api.getData(
        '/api/auth/me',
        parser: (data) => User.fromJson(Map<String, dynamic>.from(data as Map)),
      );
      final token = await _session.readToken();
      if (token == null || token.isEmpty) {
        await _session.clearSession();
        return null;
      }
      final sessionUser = user.copyWith(token: token);
      await _session.saveUser(sessionUser);
      return sessionUser;
    } on ApiException catch (error) {
      if (error.statusCode == 401 || error.statusCode == 403) {
        await _session.clearSession();
        return null;
      }
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      await _api.dio.post('/api/auth/logout');
    } finally {
      await _session.clearSession();
    }
  }

  Future<User> updateLearningTrack(
    String learningTrack, {
    String? existingToken,
  }) async {
    final user = await _api.putData(
      '/api/auth/me/learning-track',
      body: {'learningTrack': learningTrack},
      parser: (data) => User.fromJson(
        Map<String, dynamic>.from(data as Map),
      ),
    );

    final sessionUser = user.copyWith(
      learningTrack: learningTrack,
      token: existingToken,
    );
    await _session.saveUser(sessionUser);
    return sessionUser;
  }

  Future<void> persistSessionUser(User user) async {
    final token = user.token ?? await _session.readToken();
    if (token != null && token.isNotEmpty) {
      await _session.saveToken(token);
    }
    await _session.saveUser(user.copyWith(token: token));
  }

  Future<void> _persistSession(User user) async {
    final token = user.token;
    if (token == null || token.isEmpty) {
      throw ApiException('Could not save session — missing auth token.');
    }
    await _session.saveToken(token);
    await _session.saveUser(user);
  }
}
