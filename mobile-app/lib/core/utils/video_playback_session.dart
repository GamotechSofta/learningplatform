import 'package:video_player/video_player.dart';

/// Ensures only one [VideoPlayerController] plays audio at a time app-wide.
class VideoPlaybackSession {
  VideoPlaybackSession._();

  static final VideoPlaybackSession instance = VideoPlaybackSession._();

  Object? _owner;
  VideoPlayerController? _controller;

  Future<void> claim(Object owner, VideoPlayerController controller) async {
    if (_controller != null &&
        !identical(_controller, controller) &&
        _controller!.value.isInitialized) {
      try {
        await _controller!.pause();
      } catch (_) {}
    }

    _owner = owner;
    _controller = controller;
  }

  Future<void> release(Object owner, VideoPlayerController? controller) async {
    if (!identical(_owner, owner)) return;
    if (!identical(_controller, controller)) return;

    if (_controller != null && _controller!.value.isInitialized) {
      try {
        await _controller!.pause();
      } catch (_) {}
    }

    _owner = null;
    _controller = null;
  }

  Future<void> pauseActive() async {
    final controller = _controller;
    if (controller == null || !controller.value.isInitialized) return;

    try {
      await controller.pause();
    } catch (_) {}
  }
}
