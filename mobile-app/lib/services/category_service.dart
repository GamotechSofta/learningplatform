import '../core/api/api_client.dart';
import '../core/cache/app_data_cache.dart';
import '../models/category.dart';

class CategoryService {
  CategoryService(this._api);

  final ApiClient _api;
  final AppDataCache _cache = AppDataCache.instance;

  static const _publishedKey = 'categories_published';

  Future<List<Category>> getPublishedCategoriesFromDisk() async {
    final disk = await _cache.disk();
    final raw = await disk.readList(_publishedKey, AppDataCache.diskMaxAge);
    if (raw == null) return [];
    return raw.map(Category.fromJson).toList();
  }

  Future<List<Category>> getPublishedCategories({bool forceRefresh = false}) async {
    if (forceRefresh) {
      invalidatePublishedList();
    }

    try {
      return await _cache.memory.resolve(
        key: _publishedKey,
        ttl: AppDataCache.categoriesListTtl,
        forceRefresh: forceRefresh,
        fetch: () async {
          final raw = await _api.getRawList(
            '/api/categories',
            queryParameters: {'published': 'true'},
          );
          await (await _cache.disk()).writeList(_publishedKey, raw);
          return raw.map(Category.fromJson).toList();
        },
      );
    } catch (error) {
      if (!forceRefresh) {
        final fromDisk = await getPublishedCategoriesFromDisk();
        if (fromDisk.isNotEmpty) return fromDisk;
      }
      rethrow;
    }
  }

  Future<Category> getCategoryFull(
    String id, {
    bool forceRefresh = false,
  }) async {
    final cacheKey = 'category_full_$id';

    try {
      return await _cache.memory.resolve(
        key: cacheKey,
        ttl: AppDataCache.categoryDetailTtl,
        forceRefresh: forceRefresh,
        fetch: () async {
          final raw = await _api.getRawObject(
            '/api/categories/$id/full',
            queryParameters: const {'published': 'true'},
          );
          await (await _cache.disk()).writeObject(cacheKey, raw);
          return Category.fromJson(raw);
        },
      );
    } catch (error) {
      if (!forceRefresh) {
        final disk = await _cache.disk();
        final raw = await disk.readObject(cacheKey, AppDataCache.diskMaxAge);
        if (raw != null) return Category.fromJson(raw);
      }
      rethrow;
    }
  }

  void invalidatePublishedList() {
    _cache.memory.invalidate(_publishedKey);
  }

  Future<List<Category>> search(String query) async {
    if (query.trim().isEmpty) return [];

    final cacheKey = 'categories_search_${query.trim().toLowerCase()}';
    return _cache.memory.resolve(
      key: cacheKey,
      ttl: const Duration(minutes: 5),
      fetch: () => _api.getData(
        '/api/categories/search',
        queryParameters: {'q': query.trim(), 'published': 'true'},
        parser: (data) => _api.parseList(data, Category.fromJson),
      ),
    );
  }
}
