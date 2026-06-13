import 'package:dio/dio.dart';

import '../api/api_exception.dart';

class ApiErrors {
  ApiErrors._();

  static String friendlyMessage(Object error) {
    if (error is ApiException) return error.message;

    if (error is DioException) {
      final nested = error.error;
      if (nested is ApiException) return nested.message;

      final data = error.response?.data;
      if (data is Map && data['message'] is String) {
        return data['message'] as String;
      }

      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return 'Connection timed out. Check your internet and try again.';
        case DioExceptionType.connectionError:
          return 'Could not reach the server. Check your internet connection.';
        case DioExceptionType.badResponse:
          final code = error.response?.statusCode;
          if (code == 401) return 'Your session expired. Please sign in again.';
          if (code == 404) return 'This feature is not available on the server yet.';
          if (code != null && code >= 500) {
            return 'Server error ($code). Please try again in a moment.';
          }
          break;
        default:
          break;
      }

      if (error.message != null && error.message!.isNotEmpty) {
        return error.message!;
      }
    }

    final text = error.toString();
    if (text.startsWith('Exception: ')) {
      return text.replaceFirst('Exception: ', '');
    }
    if (text.contains('DioException')) {
      return 'Something went wrong while loading data. Pull to refresh.';
    }
    return text;
  }
}
