class CacheEntry<T> {
  CacheEntry(this.value, [DateTime? cachedAt])
      : cachedAt = cachedAt ?? DateTime.now();

  final T value;
  final DateTime cachedAt;

  bool isFresh(Duration ttl) => DateTime.now().difference(cachedAt) < ttl;
}

/// In-memory cache with TTL and in-flight request deduplication.
class TimedCache {
  final Map<String, CacheEntry<dynamic>> _memory = {};
  final Map<String, Future<dynamic>> _inFlight = {};

  T? peek<T>(String key, Duration ttl) {
    final entry = _memory[key];
    if (entry == null || !entry.isFresh(ttl)) return null;
    return entry.value as T;
  }

  void set<T>(String key, T value) {
    _memory[key] = CacheEntry(value);
  }

  void invalidate(String key) => _memory.remove(key);

  void invalidatePrefix(String prefix) {
    _memory.removeWhere((key, _) => key.startsWith(prefix));
  }

  Future<T> resolve<T>({
    required String key,
    required Duration ttl,
    required Future<T> Function() fetch,
    bool forceRefresh = false,
  }) async {
    if (!forceRefresh) {
      final cached = peek<T>(key, ttl);
      if (cached != null) return cached;

      final inFlight = _inFlight[key];
      if (inFlight != null) return inFlight as Future<T>;
    } else {
      _inFlight.remove(key);
    }

    final future = fetch().then((value) {
      set(key, value);
      _inFlight.remove(key);
      return value;
    }).catchError((Object error, StackTrace stack) {
      _inFlight.remove(key);
      Error.throwWithStackTrace(error, stack);
    });

    _inFlight[key] = future;
    return future;
  }
}
