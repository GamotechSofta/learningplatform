import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../services/subscription_service.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_view.dart';
import '../widgets/home/continue_learning_tile.dart';
import '../widgets/home/section_header.dart';

class MyLearningScreen extends StatefulWidget {
  const MyLearningScreen({
    super.key,
    required this.subscriptionService,
  });

  final SubscriptionService subscriptionService;

  @override
  State<MyLearningScreen> createState() => _MyLearningScreenState();
}

class _MyLearningScreenState extends State<MyLearningScreen> {
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    if (!auth.isAuthenticated) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        body: SafeArea(
          child: EmptyState(
            title: 'Sign in to view your learning',
            subtitle: 'Track enrolled courses and resume where you left off.',
            icon: Icons.play_lesson_outlined,
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: FutureBuilder(
          future: widget.subscriptionService.getUserSubscriptions(auth.user!.id),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }

            if (snapshot.hasError) {
              return ErrorView(message: snapshot.error.toString());
            }

            final subs = snapshot.data ?? [];
            final active = subs.where((s) => s.isActive).toList();

            if (active.isEmpty) {
              return const EmptyState(
                title: 'No enrolled courses',
                subtitle: 'Browse courses and start learning today.',
                icon: Icons.menu_book_outlined,
              );
            }

            return ListView(
              padding: const EdgeInsets.only(bottom: 24, top: 12),
              children: [
                const SectionHeader(title: 'My Learning'),
                const SizedBox(height: 14),
                ...active.map(
                  (sub) => Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: ContinueLearningTile(
                      course: sub.course,
                      progress: 0.35,
                      onResume: () => context.push('/courses/${sub.course.id}'),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
