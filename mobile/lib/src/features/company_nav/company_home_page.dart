import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/src/models/domain_models.dart';
import 'package:mobile/src/services/backend_service.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:table_calendar/table_calendar.dart';

enum DeptCalendarMode { viewAttendance, requestLeave, requestReimburse }

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
  List<AttendanceEntry> _attendanceHistory = [];
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();
  String? _selectedDepartmentId;
  // Mode for department calendar date taps
  DeptCalendarMode _deptMode = DeptCalendarMode.requestLeave;

  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  void _showMonthPicker() {
    showDialog(
      context: context,
      builder: (context) {
        return SimpleDialog(
          title: const Text('Pilih Bulan'),
          children: List.generate(12, (index) {
            final monthDate = DateTime(_focusedDay.year, index + 1);
            return SimpleDialogOption(
              onPressed: () {
                // Tutup dialog dulu baru update state untuk mencegah error PageController
                Navigator.pop(context);
                setState(() {
                  _focusedDay = DateTime(_focusedDay.year, index + 1, 1);
                });
                _loadLeavesForMonth(_focusedDay);
              },
              child: Text(
                DateFormat('MMMM').format(monthDate),
                style: TextStyle(
                  fontWeight: index + 1 == _focusedDay.month ? FontWeight.bold : FontWeight.normal,
                  color: index + 1 == _focusedDay.month ? Colors.blue : Colors.black,
                ),
              ),
            );
          }),
        );
      },
    );
  }

  void _showYearPicker() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Pilih Tahun'),
          content: SizedBox(
            width: 300,
            height: 300,
            child: YearPicker(
              firstDate: DateTime(DateTime.now().year - 2),
              lastDate: DateTime(DateTime.now().year + 2),
              selectedDate: _focusedDay,
              onChanged: (DateTime dateTime) {
                Navigator.pop(context);
                setState(() {
                  _focusedDay = DateTime(dateTime.year, _focusedDay.month, 1);
                });
                _loadLeavesForMonth(_focusedDay);
              },
            ),
          ),
        );
      },
    );
  }

  Future<void> _initializeData() async {
    setState(() {
      _loading = true;
    });

    try {
      final qr = await widget.service.getAttendanceQr(widget.user);
      final attendanceHistory = await widget.service.getAttendanceHistory(
        widget.user,
      );
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
        _attendanceHistory = attendanceHistory;
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

  List<AttendanceEntry> _attendanceForDay(DateTime day) {
    return _attendanceHistory.where((entry) {
      final normalized = DateTime(day.year, day.month, day.day);
      final clockInDay = DateTime(
        entry.clockIn.year,
        entry.clockIn.month,
        entry.clockIn.day,
      );
      return isSameDay(normalized, clockInDay);
    }).toList();
  }

  Future<void> _openAttendancePopup(DateTime date) async {
    final dayEntries = _attendanceForDay(date);

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
                'Riwayat Kehadiran ${DateFormat('dd MMM yyyy').format(date)}',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              if (dayEntries.isEmpty)
                const Text('Belum ada data kehadiran pada tanggal ini.')
              else
                ...dayEntries.map(
                  (entry) => ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.schedule),
                    title: Text(
                      'Masuk: ${DateFormat('HH:mm').format(entry.clockIn)}',
                    ),
                    subtitle: Text(
                      entry.clockOut == null
                          ? 'Belum clock out'
                          : 'Keluar: ${DateFormat('HH:mm').format(entry.clockOut!)}',
                    ),
                  ),
                ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => Navigator.of(sheetContext).pop(),
                  child: const Text('Tutup'),
                ),
              ),
            ],
          ),
        );
      },
    );
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
    return Scaffold(
      appBar: AppBar(title: Text('Home ${widget.user.name}')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _initializeData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _buildQrCard(),
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

                          // Dropdown Departemen
                          DropdownButtonFormField<String>(
                            value: _selectedDepartmentId,
                            decoration: const InputDecoration(
                              labelText: 'Pilih Departemen',
                            ),
                            items: _departments
                                .map(
                                  (dept) => DropdownMenuItem(
                                    value: dept.id,
                                    child: Text(dept.name),
                                  ),
                                )
                                .toList(),
                            onChanged: (value) async {
                              if (value == null) return;
                              setState(() => _selectedDepartmentId = value);
                              await _loadLeavesForMonth(_focusedDay);
                            },
                          ),

                          const SizedBox(height: 20),

                          // --- CUSTOM HEADER DENGAN NAVIGASI PANAH ---
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              // Panah Kiri
                              IconButton(
                                icon: const Icon(Icons.chevron_left),
                                onPressed: () {
                                  setState(() {
                                    _focusedDay = DateTime(
                                      _focusedDay.year,
                                      _focusedDay.month - 1,
                                    );
                                  });
                                  _loadLeavesForMonth(_focusedDay);
                                },
                              ),

                              _buildMonthYearText(),

                              // Panah Kanan
                              IconButton(
                                icon: const Icon(Icons.chevron_right),
                                onPressed: () {
                                  setState(() {
                                    _focusedDay = DateTime(
                                      _focusedDay.year,
                                      _focusedDay.month + 1,
                                    );
                                  });
                                  _loadLeavesForMonth(_focusedDay);
                                },
                              ),

                              // Dropdown Menu (Hanya 2 Opsi)
                              _buildModeDropdown(),
                            ],
                          ),
                          const SizedBox(height: 8),

                          TableCalendar<LeaveEntry>(
                            headerVisible: false, // Matikan header default
                            firstDay: DateTime.utc(2022, 1, 1),
                            lastDay: DateTime.utc(2035, 12, 31),
                            focusedDay: _focusedDay,
                            selectedDayPredicate: (day) =>
                                isSameDay(_selectedDay, day),
                            eventLoader: _entriesForDay,
                            calendarFormat: CalendarFormat.month,
                            onPageChanged: (focusedDay) async {
                              setState(() {
                                _focusedDay = focusedDay;
                              });
                              await _loadLeavesForMonth(focusedDay);
                            },
                            onDaySelected: (selectedDay, focusedDay) {
                              setState(() {
                                _selectedDay = selectedDay;
                                _focusedDay = focusedDay;
                              });
                              _handleDaySelection(selectedDay);
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

  Widget _buildMonthYearText() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        InkWell(
          onTap: _showMonthPicker,
          child: Text(
            DateFormat('MMMM').format(_focusedDay),
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, decoration: TextDecoration.underline),
          ),
        ),
        const Text(" ", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        InkWell(
          onTap: _showYearPicker,
          child: Text(
            DateFormat('yyyy').format(_focusedDay),
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, decoration: TextDecoration.underline),
          ),
        ),
      ],
    );
  }

  // Widget Dropdown diringkas menjadi 2 opsi: Lihat Kehadiran & Pengajuan
  Widget _buildModeDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.black12),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<DeptCalendarMode>(
          value: _deptMode == DeptCalendarMode.requestReimburse
              ? DeptCalendarMode.requestLeave
              : _deptMode,
          isDense: true,
          icon: const Icon(Icons.arrow_drop_down),
          onChanged: (mode) {
            if (mode != null) setState(() => _deptMode = mode);
          },
          items: [
            DropdownMenuItem(
              value: DeptCalendarMode.viewAttendance,
              child: Text('Lihat Kehadiran', style: _modeStyle()),
            ),
            DropdownMenuItem(
              value: DeptCalendarMode.requestLeave,
              child: Text('Pengajuan', style: _modeStyle()),
            ),
          ],
        ),
      ),
    );
  }

  TextStyle _modeStyle() => const TextStyle(fontSize: 12);

  void _handleDaySelection(DateTime selectedDay) {
    if (_deptMode == DeptCalendarMode.viewAttendance) {
      _openAttendancePopup(selectedDay);
    } else {
      // Jika mode adalah requestLeave (Pengajuan), buka popup pilihan pengajuan
      _openRequestPopup(selectedDay);
    }
  }

  Widget _buildQrCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('QR Absensi', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            Center(child: QrImageView(data: _qrData, size: 150)),
          ],
        ),
      ),
    );
  }
}
