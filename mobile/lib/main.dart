import 'package:flutter/material.dart';
import 'package:mobile/src/features/company_nav/company_login_page.dart';
import 'package:mobile/src/services/backend_service.dart';

void main() {
  runApp(const TwoFpcRootApp());
}

class TwoFpcRootApp extends StatelessWidget {
  const TwoFpcRootApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '2FPC',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      home: CompanyLoginPage(service: BackendService()),
    );
  }
}
