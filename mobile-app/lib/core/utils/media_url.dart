class MediaUrl {
  MediaUrl._();

  static const String cdnBase = 'https://cdn.vidyank.com';

  static String? resolve(String? value) {
    if (value == null) return null;

    final raw = value.trim();
    if (raw.isEmpty) return null;

    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      if (raw.contains('.amazonaws.com/')) {
        final uri = Uri.tryParse(raw);
        if (uri == null) return raw;
        final path = uri.path.startsWith('/') ? uri.path.substring(1) : uri.path;
        return '$cdnBase/$path';
      }
      return raw;
    }

    final normalized = raw.startsWith('/') ? raw.substring(1) : raw;
    return '$cdnBase/$normalized';
  }

  static String videoUrlFromKey(String? key, {String? externalUrl}) {
    final resolvedExternal = resolve(externalUrl);
    if (resolvedExternal != null && resolvedExternal.isNotEmpty) {
      return resolvedExternal;
    }
    return resolve(key) ?? '';
  }
}
