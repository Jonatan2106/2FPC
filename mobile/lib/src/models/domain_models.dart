enum RequestType { leave, reimburse, other }

class AppUser {
  AppUser({
    required this.id,
    required this.name,
    required this.departmentId,
    required this.departmentName,
    required this.token,
  });

  final String id;
  final String name;
  final String departmentId;
  final String departmentName;
  final String token;
}

class Department {
  Department({required this.id, required this.name});

  final String id;
  final String name;
}

class LeaveEntry {
  LeaveEntry({
    required this.id,
    required this.employeeName,
    required this.departmentId,
    required this.startDate,
    required this.endDate,
    required this.type,
  });

  final String id;
  final String employeeName;
  final String departmentId;
  final DateTime startDate;
  final DateTime endDate;
  final String type;
}

class RequestPayload {
  RequestPayload({
    required this.type,
    required this.date,
    required this.description,
    this.amount,
  });

  final RequestType type;
  final DateTime date;
  final String description;
  final num? amount;
}
