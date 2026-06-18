import 'package:flutter/material.dart';

class MainShellScope extends InheritedWidget {
  const MainShellScope({
    super.key,
    required this.selectTab,
    required this.openDrawer,
    required super.child,
  });

  final void Function(int index) selectTab;
  final VoidCallback openDrawer;

  static MainShellScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<MainShellScope>();
    assert(scope != null, 'MainShellScope not found in widget tree');
    return scope!;
  }

  static MainShellScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<MainShellScope>();
  }

  @override
  bool updateShouldNotify(MainShellScope oldWidget) =>
      selectTab != oldWidget.selectTab || openDrawer != oldWidget.openDrawer;
}
