import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../models/scanner_session.dart';
import '../services/backend_service.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({
    super.key,
    required this.service,
    required this.session,
    required this.onLogout,
  });

  final BackendService service;
  final ScannerSession session;
  final Future<void> Function() onLogout;

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final _manualTokenController = TextEditingController();

  bool _submitting = false;
  String? _statusText;
  Color _statusColor = const Color(0xFF2563EB);
  String? _lastToken;
  DateTime? _lastSubmissionAt;

  @override
  void dispose() {
    _manualTokenController.dispose();
    super.dispose();
  }

  String? _extractRawToken(BarcodeCapture capture) {
    for (final barcode in capture.barcodes) {
      final value = barcode.rawValue;
      if (value != null && value.trim().isNotEmpty) {
        return value.trim();
      }
    }
    return null;
  }

  Future<void> _submitToken(String rawToken) async {
    final normalizedToken = rawToken.trim();
    if (normalizedToken.isEmpty || _submitting) {
      return;
    }

    final now = DateTime.now();
    if (_lastToken == normalizedToken &&
        _lastSubmissionAt != null &&
        now.difference(_lastSubmissionAt!) < const Duration(seconds: 3)) {
      return;
    }

    setState(() {
      _submitting = true;
      _statusText = 'Mengirim hasil scan...';
      _statusColor = const Color(0xFF2563EB);
      _lastToken = normalizedToken;
      _lastSubmissionAt = now;
    });

    print('[ScannerDebug] QR scanned: $normalizedToken');
    print('[ScannerDebug] Token used: ${widget.session.token}');
    print('[ScannerDebug] Username: ${widget.session.username}');

    try {
      final message = await widget.service.scanAttendanceQr(
        token: widget.session.token,
        qrToken: normalizedToken,
      );
      print('[ScannerDebug] Success: $message');
      if (!mounted) {
        return;
      }
      setState(() {
        _statusText = message;
        _statusColor = const Color(0xFF047857);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
    } catch (error) {
      print('[ScannerDebug] Error: $error');
      if (!mounted) {
        return;
      }
      final message = error.toString().replaceFirst('Exception: ', '');
      setState(() {
        _statusText = message;
        _statusColor = const Color(0xFFB91C1C);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
    } finally {
      if (mounted) {
        setState(() {
          _submitting = false;
        });
      }
    }
  }

  Future<void> _submitManualToken() async {
    await _submitToken(_manualTokenController.text);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Scanner Kehadiran'),
        actions: [
          IconButton(
            tooltip: 'Logout',
            onPressed: () async {
              await widget.onLogout();
            },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
              child: _SessionHeader(session: widget.session),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(28),
                  child: Stack(
                    children: [
                      Positioned.fill(
                        child: MobileScanner(
                          fit: BoxFit.cover,
                          onDetect: (capture) {
                            final token = _extractRawToken(capture);
                            if (token != null) {
                              _submitToken(token);
                            }
                          },
                          errorBuilder: (context, error) => Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24),
                              child: Text(
                                'Kamera tidak bisa dibuka.\n${error.toString()}',
                                textAlign: TextAlign.center,
                                style: theme.textTheme.titleMedium,
                              ),
                            ),
                          ),
                          placeholderBuilder: (context) => Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const CircularProgressIndicator(),
                                const SizedBox(height: 12),
                                Text(
                                  'Menyiapkan kamera...',
                                  style: theme.textTheme.titleMedium,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Positioned.fill(
                        child: IgnorePointer(
                          child: Container(
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.16),
                                width: 24,
                              ),
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.black.withValues(alpha: 0.25),
                                  Colors.transparent,
                                  Colors.black.withValues(alpha: 0.25),
                                ],
                              ),
                            ),
                            child: Center(
                              child: Container(
                                width: 230,
                                height: 230,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(28),
                                  border: Border.all(
                                    color: Colors.white,
                                    width: 4,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        left: 16,
                        right: 16,
                        bottom: 16,
                        child: _StatusPill(
                          text: _submitting
                              ? 'Memindai...' 
                              : 'Arahkan kamera ke QR karyawan',
                          color: Colors.white,
                          backgroundColor: Colors.black.withValues(alpha: 0.7),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: TextField(
                controller: _manualTokenController,
                decoration: InputDecoration(
                  labelText: 'Tempel token QR manual',
                  border: const OutlineInputBorder(),
                  suffixIcon: IconButton(
                    tooltip: 'Kirim token',
                    onPressed: _submitting ? null : _submitManualToken,
                    icon: const Icon(Icons.send),
                  ),
                ),
                onSubmitted: (_) => _submitManualToken(),
              ),
            ),
            const SizedBox(height: 12),
            if (_statusText != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: _StatusBanner(
                  text: _statusText!,
                  backgroundColor: _statusColor.withValues(alpha: 0.12),
                  foregroundColor: _statusColor,
                ),
              ),
            // Debug info
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Text(
                    'API: ${BackendService.baseUrl}',
                    style: const TextStyle(fontSize: 10, color: Colors.grey),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SessionHeader extends StatelessWidget {
  const _SessionHeader({required this.session});

  final ScannerSession session;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: theme.colorScheme.outlineVariant),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 26,
            backgroundColor: theme.colorScheme.primaryContainer,
            child: Icon(
              Icons.badge,
              color: theme.colorScheme.primary,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  session.username,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${session.role} • siap scan QR ke attendance',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.black54,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({
    required this.text,
    required this.color,
    required this.backgroundColor,
  });

  final String text;
  final Color color;
  final Color backgroundColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _StatusBanner extends StatelessWidget {
  const _StatusBanner({
    required this.text,
    required this.backgroundColor,
    required this.foregroundColor,
  });

  final String text;
  final Color backgroundColor;
  final Color foregroundColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: foregroundColor,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
