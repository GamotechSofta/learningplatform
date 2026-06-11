import 'package:flutter_test/flutter_test.dart';
import 'package:vidyank/app.dart';

void main() {
  testWidgets('App boots', (WidgetTester tester) async {
    await tester.pumpWidget(const VidyankApp());
    expect(find.text('Vidyank'), findsOneWidget);
  });
}
