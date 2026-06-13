import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../core/theme/app_colors.dart';
import '../services/payment_service.dart';

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
  late final WebViewController _controller;
  var _loading = true;
  var _handlingResult = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (mounted) setState(() => _loading = true);
          },
          onPageFinished: (url) {
            if (_isReturnUrl(url)) {
              _completeFromReturnUrl(url);
              return;
            }
            if (mounted) setState(() => _loading = false);
          },
          onWebResourceError: (error) {
            if (!mounted) return;
            setState(() {
              _loading = false;
              _error = error.description;
            });
          },
        ),
      );

    final checkoutUrl = widget.payment.checkoutUrl;
    if (checkoutUrl.isNotEmpty) {
      _controller.loadRequest(Uri.parse(checkoutUrl));
    } else {
      setState(() {
        _loading = false;
        _error = 'Invalid checkout session. Please try again.';
      });
    }
  }

  bool _isReturnUrl(String url) =>
      url.contains('/api/payments/payu/return/success') ||
      url.contains('/api/payments/payu/return/failure');

  Future<void> _completeFromReturnUrl(String url) async {
    if (_handlingResult) return;
    _handlingResult = true;

    if (mounted) setState(() => _loading = true);

    final expectedSuccess = url.contains('/return/success');
    try {
      await Future<void>.delayed(const Duration(milliseconds: 600));
      final status = await widget.paymentService.getPaymentStatus(widget.payment.txnid);
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
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
                    const Icon(Icons.error_outline, color: AppColors.error, size: 48),
                    const SizedBox(height: 12),
                    Text(
                      _error!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Go back'),
                    ),
                  ],
                ),
              ),
            )
          else
            WebViewWidget(controller: _controller),
          if (_loading && _error == null)
            const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
        ],
      ),
    );
  }
}
