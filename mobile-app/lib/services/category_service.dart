import '../core/api/api_client.dart';
import '../models/category.dart';

class CategoryService {
  CategoryService(this._api);

  final ApiClient _api;

  Future<List<Category>> getPublishedCategories() async {
    return _api.getData(
      '/api/categories',
      queryParameters: {'published': 'true'},
      parser: (data) => _api.parseList(data, Category.fromJson),
    );
  }

  Future<Category> getCategoryFull(String id) async {
    return _api.getData(
      '/api/categories/$id/full',
      parser: (data) => Category.fromJson(Map<String, dynamic>.from(data as Map)),
    );
  }

  Future<List<Category>> search(String query) async {
    if (query.trim().isEmpty) return [];

    return _api.getData(
      '/api/categories/search',
      queryParameters: {'q': query.trim()},
      parser: (data) => _api.parseList(data, Category.fromJson),
    );
  }
}
