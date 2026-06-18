import 'package:flutter/widgets.dart';

import '../services/catalog_sync_service.dart';

class CatalogSyncListener extends StatefulWidget {
  const CatalogSyncListener({
    super.key,
    required this.sync,
    required this.child,
  });

  final CatalogSyncService sync;
  final Widget child;

  @override
  State<CatalogSyncListener> createState() => _CatalogSyncListenerState();
}

class _CatalogSyncListenerState extends State<CatalogSyncListener>
    with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    widget.sync.start();
  }

  @override
  void dispose() {
    widget.sync.stop();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      widget.sync.check();
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
