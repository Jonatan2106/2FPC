import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/src/models/domain_models.dart';
import 'package:mobile/src/services/backend_service.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:table_calendar/table_calendar.dart';

class CompanyHomePage extends StatefulWidget {
  const CompanyHomePage({super.key, required this.user, required this.service});

  final AppUser user;
  final BackendService service;

  @override
  State<CompanyHomePage> createState() => _CompanyHomePageState();
}

class _CompanyHomePageState extends State<CompanyHomePage> {
  bool _loading = true;
  String _qrData = '';
  List<Department> _departments = [];
  List<LeaveEntry> _leaves = [];
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();
  String? _selectedDepartmentId;

  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  Future<void> _initializeData() async {
    setState(() {
      _loading = true;
    });

    try {
      final qr = await widget.service.getAttendanceQr(widget.user);
      final departments = await widget.service.getDepartments(widget.user);
      final selectedDepartment =
          departments.any((dept) => dept.id == widget.user.departmentId)
          ? widget.user.departmentId
          : (departments.isNotEmpty ? departments.first.id : null);

      final leaves = selectedDepartment == null
          ? <LeaveEntry>[]
          : await widget.service.getDepartmentLeaves(
              token: widget.user.token,
              departmentId: selectedDepartment,
              month: _focusedDay,
            );

      if (!mounted) {
        return;
      }

      setState(() {
        _qrData = qr;
        _departments = departments;
        _selectedDepartmentId = selectedDepartment;
        _leaves = leaves;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Gagal memuat data: $error')));
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _loadLeavesForMonth(DateTime month) async {
    if (_selectedDepartmentId == null) {
      return;
    }

    try {
      final leaves = await widget.service.getDepartmentLeaves(
        token: widget.user.token,
        departmentId: _selectedDepartmentId!,
        month: month,
      );
      if (!mounted) {
        return;
      }
      setState(() {
        _leaves = leaves;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal memuat kalender cuti: $error')),
      );
    }
  }

  List<LeaveEntry> _entriesForDay(DateTime day) {
    return _leaves.where((entry) {
      final normalized = DateTime(day.year, day.month, day.day);
      final start = DateTime(
        entry.startDate.year,
        entry.startDate.month,
        entry.startDate.day,
      );
      final end = DateTime(
        entry.endDate.year,
        entry.endDate.month,
        entry.endDate.day,
      );
      return !normalized.isBefore(start) && !normalized.isAfter(end);
    }).toList();
  }

  Future<void> _openRequestPopup(DateTime date) async {
    final dayEntries = _entriesForDay(date);

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(sheetContext).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Tanggal ${DateFormat('dd MMM yyyy').format(date)}',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              Text(
                'Sedang cuti (${dayEntries.length}):',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 6),
              if (dayEntries.isEmpty)
                const Text('Belum ada staff cuti pada tanggal ini.')
              else
                ...dayEntries.map(
                  (entry) => ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.event_busy),
                    title: Text(entry.employeeName),
                    subtitle: Text('Jenis: ${entry.type}'),
                  ),
                ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                children: [
                  FilledButton.icon(
                    onPressed: () {
                      Navigator.of(sheetContext).pop();
                      _openRequestForm(type: RequestType.leave, date: date);
                    },
                    icon: const Icon(Icons.beach_access),
                    label: const Text('Request Cuti'),
                  ),
                  FilledButton.tonalIcon(
                    onPressed: () {
                      Navigator.of(sheetContext).pop();
                      _openRequestForm(type: RequestType.reimburse, date: date);
                    },
                    icon: const Icon(Icons.receipt_long),
                    label: const Text('Request Reimburse'),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _openRequestForm({
    required RequestType type,
    required DateTime date,
  }) async {
    final descriptionController = TextEditingController();
    final amountController = TextEditingController();

    final submitted = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: Text(
            type == RequestType.leave ? 'Request Cuti' : 'Request Reimburse',
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: descriptionController,
                decoration: const InputDecoration(labelText: 'Deskripsi'),
              ),
              if (type == RequestType.reimburse) ...[
                const SizedBox(height: 12),
                TextField(
                  controller: amountController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Nominal'),
                ),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: const Text('Batal'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: const Text('Kirim'),
            ),
          ],
        );
      },
    );

    if (submitted != true) {
      return;
    }

    final description = descriptionController.text.trim();
    if (description.isEmpty) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Deskripsi wajib diisi.')));
      return;
    }

    num? amount;
    if (type == RequestType.reimburse) {
      amount = num.tryParse(amountController.text.trim());
      if (amount == null || amount <= 0) {
        if (!mounted) {
          return;
        }
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Nominal reimburse tidak valid.')),
        );
        return;
      }
    }

    try {
      await widget.service.submitRequest(
        user: widget.user,
        request: RequestPayload(
          type: type,
          date: date,
          description: description,
          amount: amount,
        ),
      );
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Request berhasil dikirim.')),
      );
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Gagal mengirim request: $error')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedDeptValue = _selectedDepartmentId;

    return Scaffold(
      appBar: AppBar(title: Text('Home ${widget.user.name}')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _initializeData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'QR Absensi',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'QR ini muncul otomatis setelah login berhasil.',
                          ),
                          const SizedBox(height: 12),
                          Center(
                            child: QrImageView(
                              data: _qrData,
                              size: 180,
                              version: QrVersions.auto,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Kalender Departemen',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 8),
                          DropdownButtonFormField<String>(
                            initialValue: selectedDeptValue,
                            decoration: const InputDecoration(
                              labelText: 'Pilih Departemen',
                            ),
                            items: _departments
                                .map(
                                  (dept) => DropdownMenuItem<String>(
                                    value: dept.id,
                                    child: Text(dept.name),
                                  ),
                                )
                                .toList(),
                            hint: const Text('Belum ada data departemen'),
                            onChanged: (value) async {
                              if (value == null) {
                                return;
                              }
                              setState(() {
                                _selectedDepartmentId = value;
                              });
                              await _loadLeavesForMonth(_focusedDay);
                            },
                          ),
                          const SizedBox(height: 12),
                          TableCalendar<LeaveEntry>(
                            firstDay: DateTime.utc(2022, 1, 1),
                            lastDay: DateTime.utc(2035, 12, 31),
                            focusedDay: _focusedDay,
                            selectedDayPredicate: (day) =>
                                isSameDay(_selectedDay, day),
                            eventLoader: _entriesForDay,
                            calendarFormat: CalendarFormat.month,
                            onPageChanged: (focusedDay) async {
                              _focusedDay = focusedDay;
                              await _loadLeavesForMonth(focusedDay);
                            },
                            onDaySelected: (selectedDay, focusedDay) async {
                              setState(() {
                                _selectedDay = selectedDay;
                                _focusedDay = focusedDay;
                              });
                              await _openRequestPopup(selectedDay);
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
