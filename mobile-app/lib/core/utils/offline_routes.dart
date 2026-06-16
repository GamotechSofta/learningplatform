bool isOfflineAllowedRoute(String location) {
  if (location == '/downloads') return true;
  return RegExp(r'^/courses/[^/]+/lessons/[^/]+/videos/[^/]+$').hasMatch(location);
}
