import '../core/api/api_exception.dart';
import '../core/api/api_client.dart';
import '../models/user.dart';
import 'session_storage.dart';

class OtpSendResult {
  const OtpSendResult({
    required this.phone,
    this.expiresInMinutes = 10,
  });

  final String phone;
  final int expiresInMinutes;

  factory OtpSendResult.fromJson(Map<String, dynamic> json) {
    return OtpSendResult(
      phone: json['phone']?.toString() ?? '',
      expiresInMinutes: (json['expiresInMinutes'] as num?)?.toInt() ?? 10,
    );
  }
}

class SignupOtpResult {
  const SignupOtpResult({
    required this.signupToken,
    required this.phone,
    required this.name,
    required this.email,
  });

  final String signupToken;
  final String phone;
  final String name;
  final String email;

  factory SignupOtpResult.fromJson(Map<String, dynamic> json) {
    return SignupOtpResult(
      signupToken: json['signupToken']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
    );
  }
}

class AuthService {
  AuthService(this._api, {SessionStorage? session})
      : _session = session ?? SessionStorage();

  final ApiClient _api;
  final SessionStorage _session;

  Future<OtpSendResult> sendLoginOtp({required String phone}) async {
    return _api.postData(
      '/api/auth/login/send-otp',
      body: {'phone': phone},
      parser: (data) =>
          OtpSendResult.fromJson(Map<String, dynamic>.from(data as Map)),
    );
  }

  Future<User> verifyLoginOtp({
    required String phone,
    required String otp,
  }) async {
    final user = await _api.postAuthData(
      '/api/auth/login/verify-otp',
      body: {'phone': phone, 'otp': otp},
      parser: (data, token) => User.fromJson(data).copyWith(token: token),
    );
    await _persistSession(user);
    return user;
  }

  Future<OtpSendResult> sendSignupOtp({
    required String name,
    required String email,
    required String phone,
  }) async {
    return _api.postData(
      '/api/auth/signup/send-otp',
      body: {'name': name, 'email': email, 'phone': phone},
      parser: (data) =>
          OtpSendResult.fromJson(Map<String, dynamic>.from(data as Map)),
    );
  }

  Future<SignupOtpResult> verifySignupOtp({
    required String phone,
    required String otp,
  }) async {
    return _api.postData(
      '/api/auth/signup/verify-otp',
      body: {'phone': phone, 'otp': otp},
      parser: (data) =>
          SignupOtpResult.fromJson(Map<String, dynamic>.from(data as Map)),
    );
  }

  Future<User> completeSignup({
    required String signupToken,
    required String password,
    required String confirmPassword,
  }) async {
    final user = await _api.postAuthData(
      '/api/auth/signup/complete',
      body: {
        'signupToken': signupToken,
        'password': password,
        'confirmPassword': confirmPassword,
      },
      parser: (data, token) => User.fromJson(data).copyWith(token: token),
    );
    await _persistSession(user);
    return user;
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
