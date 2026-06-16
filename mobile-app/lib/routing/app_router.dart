import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../providers/network_provider.dart';
import '../core/utils/offline_routes.dart';
import '../screens/category_detail_screen.dart';
import '../screens/certificate_detail_screen.dart';
import '../screens/checkout_screen.dart';
import '../screens/course_detail_screen.dart';
import '../screens/downloaded_videos_screen.dart';
import '../screens/learning_track_onboarding_screen.dart';
import '../screens/login_screen.dart';
import '../screens/main_shell.dart';
import '../screens/notifications_screen.dart';
import '../screens/register_screen.dart';
import '../screens/search_page.dart';
import '../screens/video_player_screen.dart';
import '../services/category_service.dart';
import '../services/course_service.dart';
import '../services/payment_service.dart';
import '../services/subscription_service.dart';

class AppRouter {
  AppRouter({
    required this.authProvider,
    required this.networkProvider,
    required this.categoryService,
    required this.courseService,
    required this.subscriptionService,
    required this.paymentService,
  });

  final AuthProvider authProvider;
  final NetworkProvider networkProvider;
  final CategoryService categoryService;
  final CourseService courseService;
  final SubscriptionService subscriptionService;
  final PaymentService paymentService;

  static const _publicRoutes = {'/login', '/register'};
  static const _onboardingRoute = '/onboarding/learning-track';

  late final GoRouter router = GoRouter(
    initialLocation: '/',
    refreshListenable: Listenable.merge([authProvider, networkProvider]),
    redirect: (context, state) {
      final location = state.matchedLocation;
      final isPublic = _publicRoutes.contains(location);

      if (networkProvider.isOffline && !isOfflineAllowedRoute(location)) {
        return '/downloads';
      }

      if (!authProvider.isAuthenticated && !isPublic && !networkProvider.isOffline) {
        return '/login';
      }

      if (authProvider.isAuthenticated && isPublic) {
        return authProvider.needsLearningTrack ? _onboardingRoute : '/';
      }

      if (authProvider.isAuthenticated && authProvider.needsLearningTrack) {
        if (location != _onboardingRoute) return _onboardingRoute;
        return null;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => MainShell(
          categoryService: categoryService,
          courseService: courseService,
          subscriptionService: subscriptionService,
        ),
      ),
      GoRoute(
        path: '/onboarding/learning-track',
        builder: (context, state) => const LearningTrackOnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/downloads',
        builder: (context, state) {
          return DownloadedVideosScreen(
            courseService: courseService,
          );
        },
      ),
      GoRoute(
        path: '/search',
        builder: (context, state) => SearchPage(categoryService: categoryService),
      ),
      GoRoute(
        path: '/categories/:id',
        builder: (context, state) => CategoryDetailScreen(
          categoryId: state.pathParameters['id']!,
          categoryService: categoryService,
        ),
      ),
      GoRoute(
        path: '/courses/:id',
        builder: (context, state) => CourseDetailScreen(
          courseId: state.pathParameters['id']!,
          courseService: courseService,
          showPurchaseThanks: state.uri.queryParameters['thanks'] == '1',
        ),
      ),
      GoRoute(
        path: '/courses/:id/checkout',
        builder: (context, state) => CheckoutScreen(
          courseId: state.pathParameters['id']!,
          courseService: courseService,
          paymentService: paymentService,
        ),
      ),
      GoRoute(
        path: '/certificates/:id',
        builder: (context, state) => CertificateDetailScreen(
          certificateId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/courses/:courseId/lessons/:lessonId/videos/:videoId',
        builder: (context, state) => VideoPlayerScreen(
          courseId: state.pathParameters['courseId']!,
          lessonId: state.pathParameters['lessonId']!,
          videoId: state.pathParameters['videoId']!,
          courseService: courseService,
        ),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(title: const Text('Not found')),
      body: Center(child: Text(state.error?.toString() ?? 'Page not found')),
    ),
  );
}
