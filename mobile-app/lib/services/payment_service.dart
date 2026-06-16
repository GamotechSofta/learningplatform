import '../core/api/api_client.dart';
import '../core/api/api_exception.dart';
import '../config/app_config.dart';

class PayUPaymentInit {
  const PayUPaymentInit({
    required this.txnid,
    required this.checkoutUrl,
    required this.paymentUrl,
    required this.params,
  });

  final String txnid;
  final String checkoutUrl;
  final String paymentUrl;
  final Map<String, String> params;

  factory PayUPaymentInit.fromJson(Map<String, dynamic> json) {
    final paramsRaw = json['params'];
    final params = <String, String>{};
    if (paramsRaw is Map) {
      paramsRaw.forEach((key, value) {
        params[key.toString()] = value?.toString() ?? '';
      });
    }

    final checkoutUrl = json['checkoutUrl']?.toString() ?? '';

    return PayUPaymentInit(
      txnid: json['txnid']?.toString() ?? '',
      checkoutUrl: checkoutUrl,
      paymentUrl: json['paymentUrl']?.toString() ?? '',
      params: params,
    );
  }
}

class PayUPaymentStatus {
  const PayUPaymentStatus({
    required this.txnid,
    required this.status,
    this.payuStatus,
  });

  final String txnid;
  final String status;
  final String? payuStatus;

  bool get isSuccess => status == 'success';
}

class PaymentService {
  PaymentService(this._api);

  final ApiClient _api;

  Future<PayUPaymentInit> initiatePayU({
    required String courseId,
    required String plan,
  }) {
    return _api.postData(
      '/api/payments/payu/initiate',
      body: {
        'courseId': courseId,
        'plan': plan,
        'returnBaseUrl': AppConfig.apiBaseUrl,
      },
      parser: (data) {
        final map = Map<String, dynamic>.from(data as Map);
        final init = PayUPaymentInit.fromJson(map);
        if (init.paymentUrl.isEmpty || init.params.isEmpty) {
          throw ApiException('Payment server returned an incomplete PayU session.');
        }
        return init;
      },
    );
  }

  Future<PayUPaymentStatus> getPaymentStatus(String txnid) {
    return _api.getData(
      '/api/payments/payu/status/$txnid',
      parser: (data) {
        final map = Map<String, dynamic>.from(data as Map);
        return PayUPaymentStatus(
          txnid: map['txnid']?.toString() ?? txnid,
          status: map['status']?.toString() ?? 'pending',
          payuStatus: map['payuStatus']?.toString(),
        );
      },
    );
  }
}

String friendlyPaymentError(Object error) {
  final message = error.toString().toLowerCase();
  if (message.contains('cannot post /api/payments') ||
      message.contains('404') && message.contains('payment')) {
    return 'Payment service is not available on the server yet. Deploy the latest backend to ${AppConfig.apiBaseUrl} or run the app against your local API.';
  }
  if (message.contains('payu credentials')) {
    return 'PayU is not configured on the server. Add PAYU_KEY and PAYU_SALT to backend .env.';
  }
  return error.toString().replaceFirst('ApiException: ', '');
}
