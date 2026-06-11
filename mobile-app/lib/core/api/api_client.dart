import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../config/app_config.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage() {
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
          final token = await _storage.read(key: _tokenKey);
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

  static const _tokenKey = 'auth_token';

  late final Dio _dio;
  final FlutterSecureStorage _storage;

  Dio get dio => _dio;

  Future<void> saveToken(String token) =>
      _storage.write(key: _tokenKey, value: token);

  Future<void> clearToken() => _storage.delete(key: _tokenKey);

  Future<T> getData<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    required T Function(dynamic json) parser,
  }) async {
    final response = await _dio.get(path, queryParameters: queryParameters);
    return _parseEnvelope(response.data, parser);
  }

  Future<T> postData<T>(
    String path, {
    Map<String, dynamic>? body,
    required T Function(dynamic json) parser,
  }) async {
    final response = await _dio.post(path, data: body);
    return _parseEnvelope(response.data, parser);
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
