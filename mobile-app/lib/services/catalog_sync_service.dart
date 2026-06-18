import 'dart:async';

import '../core/api/api_client.dart';
import '../providers/catalog_provider.dart';
import 'category_service.dart';
import 'course_service.dart';

/// Polls `/api/catalog/revision` and refreshes catalog caches when admin content changes.
class CatalogSyncService {
  CatalogSyncService({
    required ApiClient api,
    required CatalogProvider catalogProvider,
    required CategoryService categoryService,
    required CourseService courseService,
  })  : _api = api,
        _catalogProvider = catalogProvider,
        _categoryService = categoryService,
        _courseService = courseService;

  final ApiClient _api;
  final CatalogProvider _catalogProvider;
  final CategoryService _categoryService;
  final CourseService _courseService;

  static const _pollInterval = Duration(seconds: 45);

  int? _revision;
  Timer? _timer;
  bool _checking = false;

  Future<void> check() async {
    if (_checking) return;
    _checking = true;

    try {
      final raw = await _api.getRawObject('/api/catalog/revision');
      final revision = (raw['revision'] as num?)?.toInt();
      if (revision == null) return;

      if (_revision != null && _revision != revision) {
        _categoryService.invalidatePublishedList();
        _categoryService.invalidateAllDetails();
        _courseService.invalidatePublishedList();
        _courseService.invalidateAllDetails();
        await _catalogProvider.load(forceRefresh: true);
      }

      _revision = revision;
    } catch (_) {
      // Best-effort; next poll or resume will retry.
    } finally {
      _checking = false;
    }
  }

  void start() {
    unawaited(check());
    _timer?.cancel();
    _timer = Timer.periodic(_pollInterval, (_) => check());
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
  }
}
