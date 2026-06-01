import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:mobile/src/models/domain_models.dart';
import 'package:mobile/src/services/device_id_service.dart';

class BackendService {
  BackendService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8080/api',
  );

  Future<AppUser> login({
    required String username,
    required String password,
  }) async {
    try {
      final deviceId = await DeviceIdService.getOrCreateDeviceId();
      print('[Login] Device ID: $deviceId');

      final result = await _getJson(
        path: '/mobile/auth/login',
        query: {
          'username': username,
          'password': password,
          'device_id': deviceId,
        },
      );
      print('[Login] Backend response: $result');
      
      final data = (result['data'] as Map?)?.cast<String, dynamic>() ?? result;

      final token = (data['token'] ?? '').toString();

      if (token.isEmpty) {
        throw Exception('Token login tidak ditemukan dari backend.');
      }

      return AppUser(
        id: (data['user_id'] ?? '').toString(),
        name: (data['username'] ?? 'Staff').toString(),
        departmentId: 'unknown',
        departmentName: 'Departemen',
        token: token,
      );
    } catch (e) {
      print('[Login Error] $e');
      rethrow;
    }
  }

  Future<String> getAttendanceQr(AppUser user) async {
    final result = await _getJson(
      path: '/mobile/attendance/qr',
      token: user.token,
    );
    final data = (result['data'] as Map?)?.cast<String, dynamic>() ?? result;
    final token = (data['qr_token'] ?? '').toString();

    if (token.isEmpty) {
      throw Exception('QR absensi tidak ditemukan dari backend.');
    }

    return token;
  }

  Future<List<AttendanceEntry>> getAttendanceHistory(AppUser user) async {
    final result = await _getJson(
      path: '/mobile/attendance',
      token: user.token,
      query: {'user_id': user.id},
    );

    final rawList = result['data'];
    if (rawList is! List) {
      return const [];
    }

    return rawList
        .whereType<Map<String, dynamic>>()
        .map(
          (item) => AttendanceEntry(
            id: (item['attendance_id'] ?? item['id'] ?? '').toString(),
            userId: (item['user_id'] ?? user.id).toString(),
            clockIn: DateTime.tryParse((item['clock_in'] ?? '').toString()) ??
                DateTime.now(),
            clockOut: DateTime.tryParse((item['clock_out'] ?? '').toString()),
          ),
        )
        .where((item) => item.id.isNotEmpty)
        .toList();
  }

  Future<List<Department>> getDepartments(AppUser user) async {
    final result = await _getJson(path: '/web/departments', token: user.token);
    final rawList = result['data'];

    if (rawList is! List) {
      return const [];
    }

    return rawList
        .map(
          (item) => Department(
            id: (item['departement_id'] ?? item['id'] ?? '').toString(),
            name: (item['company_name'] ?? item['name'] ?? 'Departemen')
                .toString(),
          ),
        )
        .where((item) => item.id.isNotEmpty)
        .toList();
  }

  Future<List<LeaveEntry>> getDepartmentLeaves({
    required String token,
    required String departmentId,
    required DateTime month,
  }) async {
    final result = await _getJson(
      path: '/web/admin/leave-requests/timeline',
      token: token,
    );

    final rawList = result['data'];
    if (rawList is! List) {
      return const [];
    }

    return rawList
        .whereType<Map<String, dynamic>>()
        .map((item) => _mapLeaveEntry(item, fallbackDepartmentId: departmentId))
        .where(
          (entry) =>
              entry.departmentId == departmentId &&
              entry.startDate.year == month.year &&
              entry.startDate.month == month.month,
        )
        .toList();
  }

  Future<void> submitRequest({
    required AppUser user,
    required RequestPayload request,
  }) async {
    final path = switch (request.type) {
      RequestType.leave => '/web/leave-requests',
      RequestType.reimburse => '/web/reimburse-requests',
      RequestType.other => '/web/leave-requests',
    };

    final payload = {
      'user_id': user.id,
      if (request.type == RequestType.leave) 'reason': request.description,
      if (request.type == RequestType.reimburse)
        'evidence':
            '${request.description} | nominal: ${request.amount?.toStringAsFixed(0) ?? '-'} | tanggal: ${DateFormat('yyyy-MM-dd').format(request.date)}',
      if (request.type == RequestType.reimburse && request.amount != null)
        'amount': request.amount,
    };

    await _postJson(path: path, token: user.token, body: payload);
  }

  LeaveEntry _mapLeaveEntry(
    Map<String, dynamic> item, {
    required String fallbackDepartmentId,
  }) {
    final now = DateTime.now();
    final requestDate =
        DateTime.tryParse((item['requested_at'] ?? '').toString()) ?? now;

    return LeaveEntry(
      id: (item['leave_id'] ?? item['id'] ?? '').toString(),
      employeeName: 'User ${item['user_id'] ?? '-'}',
      departmentId: (item['departement_id'] ?? fallbackDepartmentId).toString(),
      startDate: requestDate,
      endDate: requestDate,
      type: (item['approved'] == true) ? 'cuti disetujui' : 'menunggu approval',
    );
  }

  Future<Map<String, dynamic>> _getJson({
    required String path,
    String? token,
    Map<String, String>? query,
  }) async {
    final uri = Uri.parse('$_baseUrl$path').replace(queryParameters: query);
    final res = await _client
        .get(
          uri,
          headers: {
            'Content-Type': 'application/json',
            if (token != null) 'Authorization': 'Bearer $token',
          },
        )
        .timeout(const Duration(seconds: 15));

    return _parseResponse(res);
  }

  Future<Map<String, dynamic>> _postJson({
    required String path,
    String? token,
    required Map<String, dynamic> body,
  }) async {
    final uri = Uri.parse('$_baseUrl$path');
    final res = await _client
        .post(
          uri,
          headers: {
            'Content-Type': 'application/json',
            if (token != null) 'Authorization': 'Bearer $token',
          },
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 15));

    return _parseResponse(res);
  }

  Map<String, dynamic> _parseResponse(http.Response res) {
    final bodyText = res.body.trim();
    final dynamic decoded = bodyText.isEmpty
        ? <String, dynamic>{}
        : jsonDecode(bodyText);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (decoded is Map<String, dynamic>) {
        return decoded;
      }
      return {'data': decoded};
    }

    final message = decoded is Map<String, dynamic>
        ? (decoded['message'] ?? decoded['error'] ?? 'Request gagal').toString()
        : 'Request gagal (${res.statusCode})';
    throw Exception(message);
  }
}
