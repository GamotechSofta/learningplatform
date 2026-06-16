import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';

enum NetworkStatus {
  online,
  offline,
}

class NetworkProvider extends ChangeNotifier {
  NetworkProvider() {
    _init();
  }

  final Connectivity _connectivity = Connectivity();
  NetworkStatus _status = NetworkStatus.online;
  StreamSubscription<List<ConnectivityResult>>? _subscription;

  NetworkStatus get status => _status;
  bool get isOffline => _status == NetworkStatus.offline;

  Future<void> _init() async {
    final initial = await _connectivity.checkConnectivity();
    _updateFromResults(initial);

    _subscription =
        _connectivity.onConnectivityChanged.listen(_updateFromResults);
  }

  void _updateFromResults(List<ConnectivityResult> results) {
    final connected = _hasConnection(results);
    final next = connected ? NetworkStatus.online : NetworkStatus.offline;
    if (next == _status) return;
    _status = next;
    notifyListeners();
  }

  bool _hasConnection(List<ConnectivityResult> results) {
    if (results.isEmpty) return false;
    return results.any(
      (result) =>
          result == ConnectivityResult.mobile ||
          result == ConnectivityResult.wifi ||
          result == ConnectivityResult.ethernet ||
          result == ConnectivityResult.vpn,
    );
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}
