import 'package:flutter/material.dart';

/// Unfocuses the active text field when the user taps outside of it.
class DismissFocusOnTap extends StatelessWidget {
  const DismissFocusOnTap({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusManager.instance.primaryFocus?.unfocus(),
      behavior: HitTestBehavior.deferToChild,
      child: child,
    );
  }
}
