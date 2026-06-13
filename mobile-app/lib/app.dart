import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'config/app_config.dart';
import 'core/api/api_client.dart';
import 'core/theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/learning_progress_provider.dart';
import 'providers/notification_provider.dart';
import 'providers/saved_courses_provider.dart';
import 'providers/subscription_provider.dart';
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
import 'core/utils/notification_sync.dart';

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
  late final LearningProgressService _learningProgressService;
  NotificationService? _notificationService;
  late final AuthProvider _authProvider;
  late final SubscriptionProvider _subscriptionProvider;
  late final LearningProgressProvider _learningProgressProvider;
  SavedCoursesProvider? _savedCoursesProvider;
  NotificationProvider? _notificationProvider;
  late final AppRouter _appRouter;

  SavedCoursesProvider get _savedCourses {
    _savedCoursesProvider ??= SavedCoursesProvider(SavedCoursesService());
    return _savedCoursesProvider!;
  }

  NotificationProvider get _notifications {
    _notificationService ??= NotificationService();
    _notificationProvider ??= NotificationProvider(_notificationService!);
    return _notificationProvider!;
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
    _appRouter = AppRouter(
      authProvider: _authProvider,
      categoryService: _categoryService,
      courseService: _courseService,
      subscriptionService: _subscriptionService,
      paymentService: _paymentService,
    );
  }

  Future<void> _bootstrap() async {
    await _authProvider.bootstrap();
    final user = _authProvider.user;
    if (user != null) {
      await Future.wait([
        _subscriptionProvider.refresh(user.id),
        _learningProgressProvider.loadForUser(user.id),
        _savedCourses.loadForUser(user.id),
        _notifications.loadForUser(user.id),
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
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _authProvider),
        ChangeNotifierProvider.value(value: _subscriptionProvider),
        ChangeNotifierProvider.value(value: _learningProgressProvider),
        ChangeNotifierProvider.value(value: _savedCourses),
        ChangeNotifierProvider.value(value: _notifications),
      ],
      child: MaterialApp.router(
        title: AppConfig.appName,
        theme: AppTheme.light,
        routerConfig: _appRouter.router,
        debugShowCheckedModeBanner: false,
        builder: (context, child) {
          final loading = context.watch<AuthProvider>().loading;
          if (loading) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          return child ?? const SizedBox.shrink();
        },
      ),
    );
  }
}
