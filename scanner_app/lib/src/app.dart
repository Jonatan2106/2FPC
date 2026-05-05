import 'package:flutter/material.dart';

import 'models/scanner_session.dart';
import 'screens/login_screen.dart';
import 'screens/scanner_screen.dart';
import 'services/backend_service.dart';

class ScannerApp extends StatelessWidget {
  const ScannerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'QR Attendance Scanner',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF125B50),
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFF5F7FA),
        useMaterial3: true,
      ),
      home: const SessionGate(),
    );
  }
}

class SessionGate extends StatefulWidget {
  const SessionGate({super.key});

  @override
  State<SessionGate> createState() => _SessionGateState();
}

class _SessionGateState extends State<SessionGate> {
  final BackendService _service = BackendService();
  ScannerSession? _session;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    try {
      final restoredSession = await _service.restoreSession();
      if (!mounted) {
        return;
      }
      setState(() {
        _session = restoredSession;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  Future<void> _handleLogin(ScannerSession session) async {
    if (!mounted) {
      return;
    }
    setState(() {
      _session = session;
      _error = null;
    });
  }

  Future<void> _handleLogout() async {
    await _service.clearSession();
    if (!mounted) {
      return;
    }
    setState(() {
      _session = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (_session == null) {
      return LoginScreen(
        service: _service,
        errorText: _error,
        onLoginSuccess: _handleLogin,
      );
    }

    return ScannerScreen(
      service: _service,
      session: _session!,
      onLogout: _handleLogout,
    );
  }
}
