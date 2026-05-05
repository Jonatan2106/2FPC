import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../models/scanner_session.dart';
import 'device_id_service.dart';

class BackendService {
  BackendService({http.Client? client}) : _client = client ?? http.Client();

  static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8080/api',
  );

  static String get baseUrl => _baseUrl;

  static const String _sessionUserIdKey = 'scanner_session_user_id';
  static const String _sessionUsernameKey = 'scanner_session_username';
  static const String _sessionTokenKey = 'scanner_session_token';
  static const String _sessionRoleKey = 'scanner_session_role';

  final http.Client _client;

  Future<ScannerSession?> restoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_sessionTokenKey);
    if (token == null || token.isEmpty) {
      return null;
    }

    return ScannerSession(
      userId: prefs.getString(_sessionUserIdKey) ?? '',
      username: prefs.getString(_sessionUsernameKey) ?? '',
      token: token,
      role: prefs.getString(_sessionRoleKey) ?? 'Staff',
    );
  }

  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionUserIdKey);
    await prefs.remove(_sessionUsernameKey);
    await prefs.remove(_sessionTokenKey);
    await prefs.remove(_sessionRoleKey);
  }

  Future<ScannerSession> login({
    required String username,
    required String password,
  }) async {
    final deviceId = await DeviceIdService.getOrCreateDeviceId();
    final result = await _getJson(
      path: '/mobile/auth/login',
      query: {
        'username': username,
        'password': password,
        'device_id': deviceId,
      },
    );

    final data = (result['data'] as Map?)?.cast<String, dynamic>() ?? result;
    final token = (data['token'] ?? '').toString();

    if (token.isEmpty) {
      throw Exception('Token login tidak ditemukan dari backend.');
    }

    final session = ScannerSession(
      userId: (data['user_id'] ?? '').toString(),
      username: (data['username'] ?? username).toString(),
      token: token,
      role: (data['type'] ?? 'Staff').toString(),
    );

    await _saveSession(session);
    return session;
  }

  Future<String> scanAttendanceQr({
    required String token,
    required String qrToken,
  }) async {
    final result = await _postJson(
      path: '/mobile/attendance/clock-in/qr-scan',
      token: token,
      body: {'qr_token': qrToken},
    );

    return (result['message'] ?? 'Clock in by QR success').toString();
  }

  Future<void> _saveSession(ScannerSession session) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_sessionUserIdKey, session.userId);
    await prefs.setString(_sessionUsernameKey, session.username);
    await prefs.setString(_sessionTokenKey, session.token);
    await prefs.setString(_sessionRoleKey, session.role);
  }

  Future<Map<String, dynamic>> _getJson({
    required String path,
    String? token,
    Map<String, String>? query,
  }) async {
    final uri = Uri.parse('$_baseUrl$path').replace(queryParameters: query);
    final response = await _client
        .get(
          uri,
          headers: {
            'Content-Type': 'application/json',
            if (token != null) 'Authorization': 'Bearer $token',
          },
        )
        .timeout(const Duration(seconds: 15));

    return _parseResponse(response);
  }

  Future<Map<String, dynamic>> _postJson({
    required String path,
    String? token,
    required Map<String, dynamic> body,
  }) async {
    final uri = Uri.parse('$_baseUrl$path');
    final response = await _client
        .post(
          uri,
          headers: {
            'Content-Type': 'application/json',
            if (token != null) 'Authorization': 'Bearer $token',
          },
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 15));

    return _parseResponse(response);
  }

  Map<String, dynamic> _parseResponse(http.Response response) {
    final bodyText = response.body.trim();
    final dynamic decoded = bodyText.isEmpty ? <String, dynamic>{} : jsonDecode(bodyText);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (decoded is Map<String, dynamic>) {
        return decoded;
      }
      return {'data': decoded};
    }

    final message = decoded is Map<String, dynamic>
        ? (decoded['message'] ?? decoded['error'] ?? 'Request gagal').toString()
        : 'Request gagal (${response.statusCode})';
    throw Exception(message);
  }
}
