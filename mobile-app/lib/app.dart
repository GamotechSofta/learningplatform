import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'config/app_config.dart';
import 'core/api/api_client.dart';
import 'core/theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'routing/app_router.dart';
import 'services/auth_service.dart';
import 'services/category_service.dart';
import 'services/course_service.dart';
import 'services/subscription_service.dart';

class VidyankApp extends StatefulWidget {
  const VidyankApp({super.key});

  @override
  State<VidyankApp> createState() => _VidyankAppState();
}

class _VidyankAppState extends State<VidyankApp> {
  late final ApiClient _apiClient;
  late final AuthService _authService;
  late final CategoryService _categoryService;
  late final CourseService _courseService;
  late final SubscriptionService _subscriptionService;
  late final AuthProvider _authProvider;
  late final AppRouter _appRouter;

  @override
  void initState() {
    super.initState();
    _apiClient = ApiClient();
    _authService = AuthService(_apiClient);
    _categoryService = CategoryService(_apiClient);
    _courseService = CourseService(_apiClient);
    _subscriptionService = SubscriptionService(_apiClient);
    _authProvider = AuthProvider(_authService)..bootstrap();
    _appRouter = AppRouter(
      categoryService: _categoryService,
      courseService: _courseService,
      subscriptionService: _subscriptionService,
    );
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _authProvider),
      ],
      child: MaterialApp.router(
        title: AppConfig.appName,
        theme: AppTheme.light,
        routerConfig: _appRouter.router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
