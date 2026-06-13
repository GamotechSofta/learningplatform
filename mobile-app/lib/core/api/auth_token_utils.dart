import 'package:dio/dio.dart';

/// Reads JWT from `Set-Cookie: lp_auth=...` when the API omits `token` in JSON.
String? authTokenFromResponseHeaders(Headers headers) {
  final candidates = <String>[];

  final setCookie = headers['set-cookie'];
  if (setCookie != null) {
    candidates.addAll(setCookie);
  }

  final raw = headers.map;
  raw.forEach((key, values) {
    if (key.toLowerCase() == 'set-cookie') {
      candidates.addAll(values);
    }
  });

  for (final header in candidates) {
    final match = RegExp(r'lp_auth=([^;,\s]+)').firstMatch(header);
    if (match != null) {
      final token = match.group(1)?.trim();
      if (token != null && token.isNotEmpty) return token;
    }
  }

  return null;
}

String? resolveAuthToken({
  required Map<String, dynamic> data,
  required Headers headers,
}) {
  final fromBody = data['token']?.toString().trim();
  if (fromBody != null && fromBody.isNotEmpty) return fromBody;
  return authTokenFromResponseHeaders(headers);
}
