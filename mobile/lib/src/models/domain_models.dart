enum RequestType { leave, reimburse, other }

class AppUser {
  AppUser({
    required this.id,
    required this.name,
    required this.departmentId,
    required this.departmentName,
    required this.token,
    required this.role,
  });

  final String id;
  final String name;
  final String departmentId;
  final String departmentName;
  final String token;
  final String role;
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

class AttendanceEntry {
  AttendanceEntry({
    required this.id,
    required this.userId,
    required this.clockIn,
    required this.clockOut,
  });

  final String id;
  final String userId;
  final DateTime clockIn;
  final DateTime? clockOut;
}

class PayrollBreakdownEntry {
  PayrollBreakdownEntry({
    required this.type,
    required this.source,
    required this.label,
    required this.amount,
    this.note,
  });

  final String type;
  final String source;
  final String label;
  final String? note;
  final num amount;
}

class PayrollSummaryEntry {
  PayrollSummaryEntry({
    required this.hasPayroll,
    required this.periodLabel,
    required this.periodStart,
    required this.periodEnd,
    required this.totalIncome,
    required this.breakdown,
  });

  final bool hasPayroll;
  final String periodLabel;
  final DateTime? periodStart;
  final DateTime? periodEnd;
  final num totalIncome;
  final List<PayrollBreakdownEntry> breakdown;
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
