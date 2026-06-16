import 'dart:convert';

/// Builds PayU form POST body and helpers shared by the checkout WebView.
class PayUCheckoutLoader {
  PayUCheckoutLoader._();

  static final _attrEscape = HtmlEscape(HtmlEscapeMode.attribute);

  static String encodeFormParams(Map<String, String> params) {
    return params.entries
        .map(
          (entry) =>
              '${Uri.encodeComponent(entry.key)}=${Uri.encodeComponent(entry.value)}',
        )
        .join('&');
  }

  static List<int> encodeFormBody(Map<String, String> params) {
    return utf8.encode(encodeFormParams(params));
  }

  static String buildAutoSubmitHtml(
    String paymentUrl,
    Map<String, String> params,
  ) {
    final fields = params.entries
        .map(
          (entry) =>
              '<input type="hidden" name="${_attrEscape.convert(entry.key)}" '
              'value="${_attrEscape.convert(entry.value)}" />',
        )
        .join('\n');

    return '''
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Redirecting to PayU</title>
</head>
<body>
  <p>Redirecting to PayU…</p>
  <form id="payu" action="${_attrEscape.convert(paymentUrl)}" method="POST">
    $fields
  </form>
  <script>document.getElementById('payu').submit();</script>
</body>
</html>''';
  }

  static bool isPayUHostedUrl(String url) {
    final lower = url.toLowerCase();
    return lower.contains('payu.in') || lower.contains('payumoney.com');
  }

  static bool isReturnUrl(String url) =>
      url.contains('/api/payments/payu/return/success') ||
      url.contains('/api/payments/payu/return/failure');
}
