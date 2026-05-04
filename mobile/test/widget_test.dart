// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';

import 'package:mobile/main.dart';

void main() {
  testWidgets('2FPC launcher renders two apps', (WidgetTester tester) async {
    await tester.pumpWidget(const TwoFpcRootApp());

    expect(find.text('Pilih Aplikasi 2FPC'), findsOneWidget);
    expect(
      find.textContaining('Aplikasi 1: Navigasi Perusahaan'),
      findsOneWidget,
    );
    expect(find.textContaining('Aplikasi 2: Placeholder'), findsOneWidget);
  });
}
