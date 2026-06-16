import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/network_provider.dart';

class OfflineListener extends StatefulWidget {
  const OfflineListener({super.key, required this.child});

  final Widget child;

  @override
  State<OfflineListener> createState() => _OfflineListenerState();
}

class _OfflineListenerState extends State<OfflineListener> {
  bool _wasOffline = false;

  @override
  Widget build(BuildContext context) {
    final isOffline = context.watch<NetworkProvider>().isOffline;

    if (isOffline && !_wasOffline) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted || !context.read<NetworkProvider>().isOffline) return;
        _showOfflineDialog(context);
      });
    }
    _wasOffline = isOffline;

    return widget.child;
  }

  void _showOfflineDialog(BuildContext context) {
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => AlertDialog(
        title: const Text('No internet connection'),
        content: const Text(
          'Check your internet connection.\nYou can still watch downloaded videos offline.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('OK'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(dialogContext).pop();
              context.go('/downloads');
            },
            child: const Text('Downloaded videos'),
          ),
        ],
      ),
    );
  }
}
