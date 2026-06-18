import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/themed_colors.dart';
import '../core/utils/payu_checkout_loader.dart';
import '../services/payment_service.dart';
import '../widgets/page_app_bar.dart';

class PayUCheckoutScreen extends StatefulWidget {
  const PayUCheckoutScreen({
    super.key,
    required this.payment,
    required this.paymentService,
    required this.onFinished,
  });

  final PayUPaymentInit payment;
  final PaymentService paymentService;
  final Future<void> Function(PayUPaymentStatus status) onFinished;

  @override
  State<PayUCheckoutScreen> createState() => _PayUCheckoutScreenState();
}

class _PayUCheckoutScreenState extends State<PayUCheckoutScreen> {
  WebViewController? _controller;
  var _loading = true;
  var _handlingResult = false;
  var _slowLoad = false;
  String? _error;
  Timer? _slowLoadTimer;
  Timer? _revealTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _initWebView());
  }

  @override
  void dispose() {
    _slowLoadTimer?.cancel();
    _revealTimer?.cancel();
    super.dispose();
  }

  void _revealWebView() {
    if (!mounted || !_loading || _error != null) return;
    setState(() {
      _loading = false;
      _slowLoad = false;
    });
  }

  void _startTimers() {
    _slowLoadTimer?.cancel();
    _revealTimer?.cancel();

    _slowLoadTimer = Timer(const Duration(seconds: 10), () {
      if (mounted && _loading && _error == null) {
        setState(() => _slowLoad = true);
      }
    });

    _revealTimer = Timer(const Duration(seconds: 4), _revealWebView);
  }

  void _fail(String message) {
    _slowLoadTimer?.cancel();
    _revealTimer?.cancel();
    if (!mounted) return;
    setState(() {
      _loading = false;
      _error = message;
    });
  }

  WebViewController _createController() {
    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(AppColors.background)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (progress) {
            if (progress >= 20) _revealWebView();
          },
          onPageStarted: (url) {
            if (PayUCheckoutLoader.isReturnUrl(url)) {
              _completeFromReturnUrl(url);
              return;
            }
            if (PayUCheckoutLoader.isPayUHostedUrl(url)) {
              _revealWebView();
            }
          },
          onPageFinished: (url) {
            if (PayUCheckoutLoader.isReturnUrl(url)) {
              _completeFromReturnUrl(url);
              return;
            }
            _revealWebView();
          },
          onWebResourceError: (error) {
            if (!_isFatalWebError(error)) return;
            if (PayUCheckoutLoader.isPayUHostedUrl(error.url ?? '')) {
              _revealWebView();
              return;
            }
            _fail(_friendlyWebError(error));
          },
          onNavigationRequest: (request) {
            if (PayUCheckoutLoader.isReturnUrl(request.url)) {
              _completeFromReturnUrl(request.url);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      );

    final platform = controller.platform;
    if (!kIsWeb && platform is AndroidWebViewController) {
      platform.setMixedContentMode(MixedContentMode.alwaysAllow);
      platform.setMediaPlaybackRequiresUserGesture(false);
    }

    return controller;
  }

  Future<void> _initWebView() async {
    final paymentUrl = widget.payment.paymentUrl;
    final params = widget.payment.params;
    final checkoutUrl = widget.payment.checkoutUrl;

    if (paymentUrl.isEmpty || params.isEmpty) {
      _fail('Invalid checkout session. Please go back and try again.');
      return;
    }

    final controller = _createController();
    _controller = controller;
    if (!mounted) return;
    setState(() {});
    _startTimers();

    Object? lastError;

    if (checkoutUrl.isNotEmpty) {
      try {
        await controller.loadRequest(Uri.parse(checkoutUrl));
        return;
      } catch (error) {
        lastError = error;
        debugPrint('PayU launch GET failed: $error');
      }
    }

    try {
      await controller.loadRequest(
        Uri.parse(paymentUrl),
        method: LoadRequestMethod.post,
        headers: const {'Content-Type': 'application/x-www-form-urlencoded'},
        body: Uint8List.fromList(PayUCheckoutLoader.encodeFormBody(params)),
      );
      return;
    } catch (error) {
      lastError = error;
      debugPrint('PayU direct POST failed: $error');
    }

    try {
      await controller.loadHtmlString(
        PayUCheckoutLoader.buildAutoSubmitHtml(paymentUrl, params),
        baseUrl: Uri.parse(paymentUrl).origin,
      );
      return;
    } catch (error) {
      lastError = error;
      debugPrint('PayU HTML fallback failed: $error');
    }

    _fail(
      kDebugMode
          ? 'Could not open PayU checkout ($lastError).'
          : 'Could not open PayU checkout. Check your internet and try again.',
    );
  }

  static bool _isFatalWebError(WebResourceError error) {
    if (error.isForMainFrame != true) return false;

    final description = error.description.toLowerCase();
    if (description.contains('err_blocked_by_orb')) return false;
    if (description.contains('err_blocked_by_response')) return false;
    if (description.contains('err_unknown_url_scheme')) return false;

    return true;
  }

  static String _friendlyWebError(WebResourceError error) {
    final description = error.description.toLowerCase();
    if (description.contains('err_connection') ||
        description.contains('err_internet_disconnected')) {
      return 'Could not connect to PayU. Check your internet and try again.';
    }
    return 'PayU checkout failed to load. Please try again.';
  }

  Future<void> _completeFromReturnUrl(String url) async {
    if (_handlingResult) return;
    _handlingResult = true;

    _slowLoadTimer?.cancel();
    _revealTimer?.cancel();

    if (mounted) setState(() => _loading = true);

    final expectedSuccess = url.contains('/return/success');
    try {
      await Future<void>.delayed(const Duration(milliseconds: 800));
      final status =
          await widget.paymentService.getPaymentStatus(widget.payment.txnid);
      if (!mounted) return;
      await widget.onFinished(status);
    } catch (error) {
      if (!mounted) return;
      await widget.onFinished(
        PayUPaymentStatus(
          txnid: widget.payment.txnid,
          status: expectedSuccess ? 'pending' : 'failed',
          payuStatus: error.toString(),
        ),
      );
    } finally {
      _handlingResult = false;
    }
  }

  Future<void> _retry() async {
    setState(() {
      _loading = true;
      _slowLoad = false;
      _error = null;
      _handlingResult = false;
    });
    await _initWebView();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Scaffold(
      backgroundColor: c.background,
      appBar: PageAppBar(
        backgroundColor: c.background,
        title: const Text('PayU Checkout'),
      ),
      body: Stack(
        children: [
          if (_error != null)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline,
                        color: AppColors.error, size: 48),
                    const SizedBox(height: 12),
                    Text(
                      _error!,
                      textAlign: TextAlign.center,
                      style: TextStyle(color: c.textSecondary),
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: _retry,
                      child: const Text('Try again'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Go back'),
                    ),
                  ],
                ),
              ),
            )
          else if (_controller != null)
            WebViewWidget(controller: _controller!),
          if (_loading && _error == null)
            ColoredBox(
              color: c.background.withValues(alpha: 0.92),
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const CircularProgressIndicator(color: AppColors.primary),
                      const SizedBox(height: 16),
                      Text(
                        _slowLoad
                            ? 'PayU is still loading…'
                            : 'Opening PayU checkout…',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: c.textSecondary),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
