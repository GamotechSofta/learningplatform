import '../../models/course.dart';
import '../../models/video.dart';

class CourseVideoEntry {
  const CourseVideoEntry({
    required this.lessonId,
    required this.lessonTitle,
    required this.video,
  });

  final String lessonId;
  final String lessonTitle;
  final VideoItem video;
}

List<CourseVideoEntry> courseVideoPlaylist(Course course) {
  final items = <CourseVideoEntry>[];
  for (final lesson in course.lessons) {
    for (final video in lesson.videos) {
      items.add(
        CourseVideoEntry(
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          video: video,
        ),
      );
    }
  }
  return items;
}

bool isVideoPlayableInPlaylist(CourseVideoEntry entry) =>
    entry.video.hasPlayableSource;

CourseVideoEntry? nextPlayableVideo(Course course, String currentVideoId) {
  final playlist = courseVideoPlaylist(course);
  final currentIndex = playlist.indexWhere((e) => e.video.id == currentVideoId);
  if (currentIndex < 0) return null;

  for (var i = currentIndex + 1; i < playlist.length; i++) {
    final entry = playlist[i];
    if (isVideoPlayableInPlaylist(entry)) return entry;
  }
  return null;
}

CourseVideoEntry? previousPlayableVideo(Course course, String currentVideoId) {
  final playlist = courseVideoPlaylist(course);
  final currentIndex = playlist.indexWhere((e) => e.video.id == currentVideoId);
  if (currentIndex <= 0) return null;

  for (var i = currentIndex - 1; i >= 0; i--) {
    final entry = playlist[i];
    if (isVideoPlayableInPlaylist(entry)) return entry;
  }
  return null;
}

CourseVideoEntry? findVideoInCourse(Course course, String videoId) {
  for (final entry in courseVideoPlaylist(course)) {
    if (entry.video.id == videoId) return entry;
  }
  return null;
}

int playlistIndex(Course course, String videoId) {
  final playlist = courseVideoPlaylist(course);
  return playlist.indexWhere((e) => e.video.id == videoId);
}

CourseVideoEntry? firstPlayableVideo(Course course) {
  for (final entry in courseVideoPlaylist(course)) {
    if (isVideoPlayableInPlaylist(entry)) return entry;
  }
  return null;
}

String formatVideoDuration(int seconds) {
  if (seconds <= 0) return '';
  final hours = seconds ~/ 3600;
  final minutes = (seconds % 3600) ~/ 60;
  final remaining = seconds % 60;
  if (hours > 0) {
    return '$hours:${minutes.toString().padLeft(2, '0')}:${remaining.toString().padLeft(2, '0')}';
  }
  return '$minutes:${remaining.toString().padLeft(2, '0')}';
}
