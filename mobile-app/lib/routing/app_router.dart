import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../screens/category_detail_screen.dart';
import '../screens/course_detail_screen.dart';
import '../screens/login_screen.dart';
import '../screens/main_shell.dart';
import '../screens/register_screen.dart';
import '../screens/search_page.dart';
import '../screens/video_player_screen.dart';
import '../services/category_service.dart';
import '../services/course_service.dart';
import '../services/subscription_service.dart';

class AppRouter {
  AppRouter({
    required this.categoryService,
    required this.courseService,
    required this.subscriptionService,
  });

  final CategoryService categoryService;
  final CourseService courseService;
  final SubscriptionService subscriptionService;

  late final GoRouter router = GoRouter(
    initialLocation: '/',
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
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
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
