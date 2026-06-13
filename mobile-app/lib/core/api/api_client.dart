import 'package:dio/dio.dart';

import '../../config/app_config.dart';
import '../../services/session_storage.dart';
import 'api_exception.dart';
import 'auth_token_utils.dart';

class ApiClient {
  ApiClient({SessionStorage? session}) : _session = session ?? SessionStorage() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _session.readToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) {
          final data = error.response?.data;
          final message = data is Map && data['message'] is String
              ? data['message'] as String
              : error.message ?? 'Request failed';
          handler.reject(
            DioException(
              requestOptions: error.requestOptions,
              response: error.response,
              type: error.type,
              error: ApiException(message, statusCode: error.response?.statusCode),
            ),
          );
        },
      ),
    );
  }

  late final Dio _dio;
  final SessionStorage _session;

  Dio get dio => _dio;

  Future<void> saveToken(String token) => _session.saveToken(token);

  Future<void> clearToken() => _session.clearSession();

  Future<T> getData<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    required T Function(dynamic json) parser,
  }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return _parseEnvelope(response.data, parser);
    } on DioException catch (error) {
      _unwrap(error);
    }
  }

  Future<T> postData<T>(
    String path, {
    Map<String, dynamic>? body,
    required T Function(dynamic json) parser,
  }) async {
    try {
      final response = await _dio.post(path, data: body);
      return _parseEnvelope(response.data, parser);
    } on DioException catch (error) {
      _unwrap(error);
    }
  }

  /// Login/register — resolves JWT from JSON `token` or `Set-Cookie` (legacy API).
  Future<T> postAuthData<T>(
    String path, {
    Map<String, dynamic>? body,
    required T Function(Map<String, dynamic> json, String token) parser,
  }) async {
    try {
      final response = await _dio.post(path, data: body);
      final raw = response.data;
      if (raw is! Map || raw['success'] != true) {
        throw ApiException(
          raw is Map
              ? raw['message']?.toString() ?? 'Request failed'
              : 'Invalid server response',
          statusCode: response.statusCode,
        );
      }

      final data = raw['data'];
      if (data is! Map) {
        throw ApiException('Invalid server response');
      }

      final map = Map<String, dynamic>.from(data);
      final token = resolveAuthToken(data: map, headers: response.headers);
      if (token == null || token.isEmpty) {
        throw ApiException(
          'Sign-in succeeded but the server did not return a session token. '
          'Deploy the latest backend to api.vidyank.com and rebuild the app.',
        );
      }

      return parser(map, token);
    } on DioException catch (error) {
      _unwrap(error);
    }
  }

  Future<T> putData<T>(
    String path, {
    Map<String, dynamic>? body,
    required T Function(dynamic json) parser,
  }) async {
    try {
      final response = await _dio.put(path, data: body);
      return _parseEnvelope(response.data, parser);
    } on DioException catch (error) {
      _unwrap(error);
    }
  }

  Never _unwrap(DioException error) {
    if (error.error is ApiException) {
      throw error.error as ApiException;
    }
    throw error;
  }

  T _parseEnvelope<T>(dynamic raw, T Function(dynamic json) parser) {
    if (raw is! Map) {
      throw ApiException('Invalid server response');
    }

    if (raw['success'] != true) {
      throw ApiException(
        raw['message']?.toString() ?? 'Request failed',
      );
    }

    return parser(raw['data']);
  }

  List<T> parseList<T>(
    dynamic raw,
    T Function(Map<String, dynamic> json) itemParser,
  ) {
    if (raw is! List) return [];
    return raw
        .whereType<Map>()
        .map((item) => itemParser(Map<String, dynamic>.from(item)))
        .toList();
  }
}
