import 'disk_json_cache.dart';
import 'timed_cache.dart';

class AppDataCache {
  AppDataCache._();

  static final AppDataCache instance = AppDataCache._();

  final TimedCache memory = TimedCache();

  static const categoriesListTtl = Duration(minutes: 30);
  static const coursesListTtl = Duration(minutes: 15);
  static const courseDetailTtl = Duration(minutes: 10);
  static const categoryDetailTtl = Duration(minutes: 15);
  static const diskMaxAge = Duration(hours: 24);

  Future<DiskJsonCache> disk() => DiskJsonCache.instance;
}
