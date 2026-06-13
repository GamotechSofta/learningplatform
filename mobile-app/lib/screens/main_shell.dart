import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';
import '../navigation/main_shell_scope.dart';
import '../services/category_service.dart';
import '../services/course_service.dart';
import '../services/subscription_service.dart';
import '../widgets/app_drawer.dart';
import 'saved_courses_screen.dart';
import 'courses_screen.dart';
import 'home_screen.dart';
import 'my_learning_screen.dart';
import 'profile_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({
    super.key,
    required this.categoryService,
    required this.courseService,
    required this.subscriptionService,
  });

  final CategoryService categoryService;
  final CourseService courseService;
  final SubscriptionService subscriptionService;

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  static const _tabCount = 5;

  int _index = 0;
  PageController? _pageController;

  PageController get _pages =>
      _pageController ??= PageController(initialPage: _index);

  @override
  void dispose() {
    _pageController?.dispose();
    super.dispose();
  }

  void _selectTab(int index) {
    if (index < 0 || index >= _tabCount) return;
    if (index == _index) return;

    setState(() => _index = index);
    _pages.animateToPage(
      index,
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOutCubic,
    );
  }

  void _onPageChanged(int index) {
    if (_index != index) setState(() => _index = index);
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      HomeScreen(
        categoryService: widget.categoryService,
        courseService: widget.courseService,
        onExploreCourses: () => _selectTab(1),
      ),
      CoursesScreen(
        courseService: widget.courseService,
        categoryService: widget.categoryService,
      ),
      MyLearningScreen(
        subscriptionService: widget.subscriptionService,
        courseService: widget.courseService,
      ),
      const SavedCoursesScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      drawer: AppDrawer(onSelectTab: _selectTab),
      body: Builder(
        builder: (scaffoldContext) {
          return MainShellScope(
            selectTab: _selectTab,
            openDrawer: () => Scaffold.of(scaffoldContext).openDrawer(),
            child: PageView(
              controller: _pages,
              onPageChanged: _onPageChanged,
              physics: const PageScrollPhysics(),
              children: pages,
            ),
          );
        },
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 12,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavItem(
                  icon: Icons.home_rounded,
                  label: 'Home',
                  selected: _index == 0,
                  onTap: () => _selectTab(0),
                ),
                _NavItem(
                  icon: Icons.menu_book_rounded,
                  label: 'Courses',
                  selected: _index == 1,
                  onTap: () => _selectTab(1),
                ),
                _NavItem(
                  icon: Icons.play_lesson_rounded,
                  label: 'My Learning',
                  selected: _index == 2,
                  onTap: () => _selectTab(2),
                ),
                _NavItem(
                  icon: Icons.bookmark_rounded,
                  label: 'Saved',
                  selected: _index == 3,
                  onTap: () => _selectTab(3),
                ),
                _NavItem(
                  icon: Icons.person_rounded,
                  label: 'Profile',
                  selected: _index == 4,
                  onTap: () => _selectTab(4),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? AppColors.primary : AppColors.textSecondary;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 9,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
