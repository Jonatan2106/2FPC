import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:scanner_app/src/app.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('shows login screen when no session is stored', (tester) async {
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const ScannerApp());
    await tester.pumpAndSettle();

    expect(find.text('QR Attendance Scanner'), findsOneWidget);
    expect(find.text('Masuk'), findsOneWidget);
  });
}
