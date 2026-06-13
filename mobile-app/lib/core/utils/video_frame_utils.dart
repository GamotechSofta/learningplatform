import 'dart:io';

/// Times to sample when building a preview frame (skip t=0 — often black).
const List<int> kVideoThumbnailSampleTimesMs = [
  3000,
  8000,
];

/// Pick a seek position away from the start of the video.
Duration previewSeekPosition(Duration total) {
  const preferred = Duration(seconds: 4);
  if (total <= Duration.zero) return preferred;

  if (total > preferred + const Duration(seconds: 2)) {
    return preferred;
  }

  final fifteenPercent = Duration(
    milliseconds: (total.inMilliseconds * 0.15).round(),
  );
  if (fifteenPercent >= const Duration(seconds: 1)) {
    return fifteenPercent;
  }

  final half = Duration(milliseconds: total.inMilliseconds ~/ 2);
  if (half > Duration.zero) return half;

  return Duration.zero;
}

/// Heuristic: reject tiny or extremely dark JPEG extracts.
Future<bool> isUsableVideoFrameFile(String path) async {
  final file = File(path);
  if (!await file.exists()) return false;

  final length = await file.length();
  if (length < 1800) return false;

  final raf = await file.open();
  try {
    final toRead = length < 4096 ? length : 4096;
    final bytes = await raf.read(toRead);
    if (bytes.length < 120) return false;

    const headerSkip = 200;
    final start = bytes.length > headerSkip ? headerSkip : 0;
    var sum = 0;
    for (var i = start; i < bytes.length; i++) {
      sum += bytes[i];
    }
    final count = bytes.length - start;
    if (count <= 0) return false;

    return (sum / count) >= 18;
  } finally {
    await raf.close();
  }
}
