import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../navigation/main_shell_scope.dart';

/// Pops the route stack when possible; otherwise returns to the home shell.
void navigateBack(BuildContext context) {
  if (context.canPop()) {
    context.pop();
  } else {
    context.go('/');
  }
}

class PageBackButton extends StatelessWidget {
  const PageBackButton({
    super.key,
    this.onPressed,
    this.color,
  });

  final VoidCallback? onPressed;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(Icons.arrow_back_rounded, color: color),
      tooltip: MaterialLocalizations.of(context).backButtonTooltip,
      onPressed: onPressed ?? () => navigateBack(context),
    );
  }
}

/// Back control for bottom-nav tab pages — returns to the Home tab.
class TabPageBackButton extends StatelessWidget {
  const TabPageBackButton({super.key, this.color});

  final Color? color;

  @override
  Widget build(BuildContext context) {
    return PageBackButton(
      color: color,
      onPressed: () {
        final shell = MainShellScope.maybeOf(context);
        if (shell != null) {
          shell.selectTab(0);
        } else {
          navigateBack(context);
        }
      },
    );
  }
}

class PageAppBar extends StatelessWidget implements PreferredSizeWidget {
  const PageAppBar({
    super.key,
    this.title,
    this.actions,
    this.backgroundColor,
    this.foregroundColor,
    this.elevation,
    this.centerTitle,
    this.onBack,
    this.showBack = true,
    this.leading,
  });

  final Widget? title;
  final List<Widget>? actions;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final double? elevation;
  final bool? centerTitle;
  final VoidCallback? onBack;
  final bool showBack;
  final Widget? leading;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    Widget? effectiveLeading = leading;
    if (showBack && leading == null) {
      effectiveLeading = PageBackButton(onPressed: onBack);
    }

    return AppBar(
      leading: effectiveLeading,
      automaticallyImplyLeading: false,
      title: title,
      actions: actions,
      backgroundColor: backgroundColor,
      foregroundColor: foregroundColor,
      elevation: elevation,
      centerTitle: centerTitle,
    );
  }
}
