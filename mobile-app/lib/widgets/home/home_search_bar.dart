import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/themed_colors.dart';
import '../../core/utils/course_filter_request.dart';
import '../../navigation/main_shell_scope.dart';
import 'home_filter_sheet.dart';

class HomeSearchBar extends StatelessWidget {
  const HomeSearchBar({super.key});

  Future<void> _openFilters(BuildContext context) async {
    final shell = MainShellScope.maybeOf(context);
    final filters = await showHomeFilterSheet(context);
    if (filters == null) return;
    CourseFilterRequest.pending.value = filters;
    shell?.selectTab(1);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => context.push('/search'),
              child: Container(
                height: 52,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: c.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: c.border),
                ),
                child: Row(
                  children: [
                    Icon(Icons.search, color: c.textSecondary),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Search for courses, topics, instructors...',
                        style: TextStyle(color: c.textSecondary, fontSize: 14),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SizedBox(width: 10),
          Material(
            color: c.surface,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: c.border),
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () => _openFilters(context),
              child: const SizedBox(
                height: 52,
                width: 52,
                child: Icon(Icons.tune_rounded, color: AppColors.primary),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
