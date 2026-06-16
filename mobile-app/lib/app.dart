import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'config/app_config.dart';
import 'core/api/api_client.dart';
import 'core/theme/app_theme.dart';
import 'providers/theme_provider.dart';
import 'providers/catalog_provider.dart';
import 'providers/auth_provider.dart';
import 'providers/learning_progress_provider.dart';
import 'providers/notification_provider.dart';
import 'providers/saved_courses_provider.dart';
import 'providers/subscription_provider.dart';
import 'providers/network_provider.dart';
import 'providers/video_engagement_provider.dart';
import 'routing/app_router.dart';
import 'services/auth_service.dart';
import 'services/session_storage.dart';
import 'services/category_service.dart';
import 'services/course_service.dart';
import 'services/learning_progress_service.dart';
import 'services/notification_service.dart';
import 'services/saved_courses_service.dart';
import 'services/payment_service.dart';
import 'services/subscription_service.dart';
import 'services/video_download_service.dart';
import 'services/video_engagement_service.dart';
import 'core/utils/notification_sync.dart';
import 'widgets/offline_listener.dart';

class VidyankApp extends StatefulWidget {
  const VidyankApp({super.key});

  @override
  State<VidyankApp> createState() => _VidyankAppState();
}

class _VidyankAppState extends State<VidyankApp> {
  late final SessionStorage _session;
  late final ApiClient _apiClient;
  late final AuthService _authService;
  late final CategoryService _categoryService;
  late final CourseService _courseService;
  late final SubscriptionService _subscriptionService;
  late final PaymentService _paymentService;
  CatalogProvider? _catalogProvider;
  late final LearningProgressService _learningProgressService;
  NotificationService? _notificationService;
  late final AuthProvider _authProvider;
  late final SubscriptionProvider _subscriptionProvider;
  late final LearningProgressProvider _learningProgressProvider;
  SavedCoursesProvider? _savedCoursesProvider;
  NotificationProvider? _notificationProvider;
  VideoEngagementProvider? _videoEngagementProvider;
  NetworkProvider? _networkProvider;
  ThemeProvider? _themeProvider;
  AppRouter? _appRouter;

  SavedCoursesProvider get _savedCourses {
    _savedCoursesProvider ??= SavedCoursesProvider(SavedCoursesService());
    return _savedCoursesProvider!;
  }

  NotificationProvider get _notifications {
    _notificationService ??= NotificationService();
    _notificationProvider ??= NotificationProvider(_notificationService!);
    return _notificationProvider!;
  }

  CatalogProvider get _catalog {
    _catalogProvider ??= CatalogProvider(_categoryService, _courseService);
    return _catalogProvider!;
  }

  ThemeProvider get _theme {
    _themeProvider ??= ThemeProvider();
    return _themeProvider!;
  }

  NetworkProvider get _network {
    _networkProvider ??= NetworkProvider();
    return _networkProvider!;
  }

  VideoEngagementProvider get _videoEngagement {
    _videoEngagementProvider ??= VideoEngagementProvider(
      VideoEngagementService(),
      VideoDownloadService(),
    );
    return _videoEngagementProvider!;
  }

  @override
  void initState() {
    super.initState();
    _session = SessionStorage();
    _apiClient = ApiClient(session: _session);
    _authService = AuthService(_apiClient, session: _session);
    _categoryService = CategoryService(_apiClient);
    _courseService = CourseService(_apiClient);
    _subscriptionService = SubscriptionService(_apiClient);
    _paymentService = PaymentService(_apiClient);
    _learningProgressService = LearningProgressService();
    _authProvider = AuthProvider(_authService);
    _subscriptionProvider = SubscriptionProvider(_subscriptionService);
    _learningProgressProvider = LearningProgressProvider(_learningProgressService);
    _bootstrap();
    _ensureRouter();
  }

  void _ensureRouter() {
    _appRouter ??= AppRouter(
      authProvider: _authProvider,
      networkProvider: _network,
      categoryService: _categoryService,
      courseService: _courseService,
      subscriptionService: _subscriptionService,
      paymentService: _paymentService,
    );
  }

  @override
  void reassemble() {
    super.reassemble();
    if (kDebugMode) {
      // Drop stale router after hot reload (old instances may lack new fields).
      _appRouter = null;
      _ensureRouter();
    }
  }

  @override
  void dispose() {
    final router = _appRouter;
    if (router != null) {
      try {
        router.router.dispose();
      } catch (_) {}
    }
    super.dispose();
  }

  Future<void> _bootstrap() async {
    await _catalog.warmFromDisk();
    await Future.wait([
      _authProvider.bootstrap(),
      _catalog.load(),
    ]);
    final user = _authProvider.user;
    if (user != null) {
      await Future.wait([
        _subscriptionProvider.refresh(user.id),
        _learningProgressProvider.loadForUser(user.id),
        _savedCourses.loadForUser(user.id),
        _notifications.loadForUser(user.id),
        _videoEngagement.refreshDownloads(user.id),
      ]);
      await syncNotifications(
        userId: user.id,
        notifications: _notifications,
        subs: _subscriptionProvider,
        progress: _learningProgressProvider,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    _ensureRouter();
    final router = _appRouter!.router;

    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _theme),
        ChangeNotifierProvider.value(value: _authProvider),
        ChangeNotifierProvider.value(value: _catalog),
        ChangeNotifierProvider.value(value: _subscriptionProvider),
        ChangeNotifierProvider.value(value: _learningProgressProvider),
        ChangeNotifierProvider.value(value: _savedCourses),
        ChangeNotifierProvider.value(value: _notifications),
        ChangeNotifierProvider.value(value: _network),
        ChangeNotifierProvider.value(value: _videoEngagement),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, theme, _) => MaterialApp.router(
          title: AppConfig.appName,
          theme: AppTheme.light,
          darkTheme: AppTheme.dark,
          themeMode: theme.mode,
          routerConfig: router,
          debugShowCheckedModeBanner: false,
          builder: (context, child) {
            final loading = context.watch<AuthProvider>().loading;

            if (loading) {
              return const Scaffold(
                body: Center(child: CircularProgressIndicator()),
              );
            }

            return OfflineListener(
              child: child ?? const SizedBox.shrink(),
            );
          },
        ),
      ),
    );
  }
}
