import 'package:dio/dio.dart';

import '../api/api_exception.dart';

class ApiErrors {
  ApiErrors._();

  static String friendlyMessage(Object error) {
    if (error is ApiException) {
      return _sanitize(error.message, statusCode: error.statusCode);
    }

    if (error is DioException) {
      final nested = error.error;
      if (nested is ApiException) {
        return _sanitize(nested.message, statusCode: nested.statusCode);
      }

      final data = error.response?.data;
      if (data is Map && data['message'] is String) {
        return _sanitize(
          data['message'] as String,
          statusCode: error.response?.statusCode,
        );
      }

      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return 'Connection timed out. Check your internet and try again.';
        case DioExceptionType.connectionError:
          return 'Could not reach the server. Check your internet connection.';
        case DioExceptionType.badResponse:
          return _sanitize(
            error.message ?? 'Request failed',
            statusCode: error.response?.statusCode,
          );
        default:
          break;
      }

      if (error.message != null && error.message!.isNotEmpty) {
        return _sanitize(error.message!);
      }
    }

    final text = error.toString();
    if (text.startsWith('Exception: ')) {
      return _sanitize(text.replaceFirst('Exception: ', ''));
    }
    if (text.contains('DioException')) {
      return 'Something went wrong. Please try again.';
    }
    return _sanitize(text);
  }

  static String _sanitize(String message, {int? statusCode}) {
    final lower = message.toLowerCase();
    final looksLikeDioDump = lower.contains('validatestatus') ||
        lower.contains('requestoptions') ||
        lower.contains('status code of') ||
        lower.contains('developer.mozilla.org');

    final hasServerMessage = message.trim().isNotEmpty &&
        !looksLikeDioDump &&
        lower != 'request failed';

    if (statusCode != null && statusCode >= 500) {
      return hasServerMessage
          ? message
          : 'Server error ($statusCode). Please try again in a moment.';
    }
    if (hasServerMessage) return message;

    if (statusCode == 404 || lower.contains('404')) {
      return 'This feature is not available on the server yet. Please try again later.';
    }
    if (statusCode == 401) {
      return 'Your session expired. Please sign in again.';
    }
    return 'Something went wrong while contacting the server. Please try again.';
  }
}
