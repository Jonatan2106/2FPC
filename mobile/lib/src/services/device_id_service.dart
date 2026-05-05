import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

class DeviceIdService {
  DeviceIdService._();

  static const String _deviceIdKey = 'company_device_id';

  static Future<String> getOrCreateDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    final existingId = prefs.getString(_deviceIdKey);

    if (existingId != null && existingId.isNotEmpty) {
      return existingId;
    }

    final newId = const Uuid().v4();
    await prefs.setString(_deviceIdKey, newId);
    return newId;
  }
}