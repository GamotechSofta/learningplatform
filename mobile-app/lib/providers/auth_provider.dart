import 'package:flutter/foundation.dart';

import '../core/api/api_exception.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/learning_track_service.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider(this._authService);

  final AuthService _authService;
  LearningTrackService? _learningTrackService;

  LearningTrackService get _learningTracks =>
      _learningTrackService ??= LearningTrackService();

  User? _user;
  bool _loading = true;

  User? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get loading => _loading;

  /// True when a logged-in student has not chosen a learning track yet.
  bool get needsLearningTrack =>
      _user != null &&
      _user!.role == 'student' &&
      !_user!.hasLearningTrack;

  Future<void> bootstrap() async {
    _loading = true;
    notifyListeners();

    try {
      final cached = await _authService.restoreSession();
      if (cached != null &&
          cached.token != null &&
          cached.token!.isNotEmpty &&
          cached.id.isNotEmpty) {
        _user = await _mergeLocalLearningTrack(cached);
        notifyListeners();
      } else if (cached != null) {
        await _authService.logout();
      }

      try {
        final fresh = await _authService
            .refreshSession()
            .timeout(const Duration(seconds: 15));
        if (fresh != null) {
          _user = await _mergeLocalLearningTrack(fresh);
        } else if (cached != null) {
          _user = null;
        }
      } on ApiException catch (error) {
        if (error.statusCode == 401 || error.statusCode == 403) {
          _user = null;
        }
      } catch (_) {
        // Offline or slow network — keep cached session.
      }
    } catch (_) {
      _user = null;
    }

    _loading = false;
    notifyListeners();
  }

  Future<OtpSendResult> sendLoginOtp(String phone) {
    return _authService.sendLoginOtp(phone: phone);
  }

  Future<void> verifyLoginOtp(String phone, String otp) async {
    final user = await _authService.verifyLoginOtp(phone: phone, otp: otp);
    _user = await _mergeLocalLearningTrack(user);
    notifyListeners();
  }

  Future<OtpSendResult> sendSignupOtp({
    required String name,
    required String email,
    required String phone,
  }) {
    return _authService.sendSignupOtp(
      name: name,
      email: email,
      phone: phone,
    );
  }

  Future<SignupOtpResult> verifySignupOtp(String phone, String otp) {
    return _authService.verifySignupOtp(phone: phone, otp: otp);
  }

  Future<void> completeSignup({
    required String signupToken,
    required String password,
    required String confirmPassword,
  }) async {
    final user = await _authService.completeSignup(
      signupToken: signupToken,
      password: password,
      confirmPassword: confirmPassword,
    );
    _user = await _mergeLocalLearningTrack(user);
    notifyListeners();
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    notifyListeners();
  }

  Future<void> updateLearningTrack(String learningTrack) async {
    final current = _user;
    if (current == null) return;

    await _learningTracks.saveLocalTrack(current.id, learningTrack);
    _user = current.copyWith(learningTrack: learningTrack);
    await _authService.persistSessionUser(_user!);
    notifyListeners();

    try {
      final updated = await _authService.updateLearningTrack(
        learningTrack,
        existingToken: current.token,
      );
      _user = updated.copyWith(
        learningTrack: learningTrack,
        token: current.token ?? updated.token,
      );
      notifyListeners();
    } catch (_) {
      // Saved locally — keep working when the API route is not deployed yet.
    }
  }

  Future<User> _mergeLocalLearningTrack(User user) async {
    if (user.hasLearningTrack) return user;

    final local = await _learningTracks.getLocalTrack(user.id);
    if (local == null || local.isEmpty) return user;

    return user.copyWith(learningTrack: local);
  }

  String? get userId => _user?.id;
}
