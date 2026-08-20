import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/src/models/domain_models.dart';
import 'package:mobile/src/services/backend_service.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:qr_flutter/qr_flutter.dart';

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
  bool _payrollLoading = false;
  String _qrData = '';
  List<Department> _departments = [];
  List<LeaveEntry> _leaves = [];
  List<AttendanceEntry> _attendanceHistory = [];
  PayrollSummaryEntry? _payrollSummary;
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();
  String? _selectedDepartmentId;

  // Mode for department calendar date taps
  // DeptCalendarMode _deptMode = DeptCalendarMode.requestLeave;

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
                Navigator.pop(context);
                setState(() {
                  _focusedDay = DateTime(_focusedDay.year, index + 1, 1);
                });
                _loadLeavesForMonth(_focusedDay);
              },
              child: Text(
                DateFormat('MMMM').format(monthDate),
                style: TextStyle(
                  fontWeight: index + 1 == _focusedDay.month
                      ? FontWeight.bold
                      : FontWeight.normal,
                  color: index + 1 == _focusedDay.month
                      ? Colors.blue
                      : Colors.black,
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
    if (!mounted) return;
    setState(() {
      _loading = true;
    });

    try {
      // 1. Fetch QR secara mandiri
      try {
        final qr = await widget.service.getAttendanceQr(widget.user);
        _qrData = qr;
      } catch (e) {
        print('Error Fetch QR: $e');
        _qrData = 'ERROR: $e'; // Simpan pesan error agar bisa dilihat
      }

      // 2. Fetch History secara mandiri
      try {
        _attendanceHistory = await widget.service.getAttendanceHistory(
          widget.user,
        );
      } catch (e) {
        print('Error Fetch History: $e');
      }

      // 3. Fetch Departemen secara mandiri
      try {
        _departments = await widget.service.getDepartments(widget.user);
        if (_departments.isNotEmpty) {
          if (widget.user.role == 'Admin') {
            _selectedDepartmentId =
                _departments.any((d) => d.id == widget.user.departmentId)
                ? widget.user.departmentId
                : _departments.first.id;
          } else {
            _selectedDepartmentId = widget.user.departmentId;
          }
        }
      } catch (e) {
        print('Error Fetch Departments: $e');
      }

      // 4. Fetch Leaves jika departemen terpilih
      if (_selectedDepartmentId != null) {
        try {
          _leaves = await widget.service.getDepartmentLeaves(
            token: widget.user.token,
            departmentId: _selectedDepartmentId!,
            month: _focusedDay,
            userRole: widget.user.role,
          );
        } catch (e) {
          print('Error Fetch Leaves: $e');
        }
      }

      await _loadPayrollForDay(_selectedDay);
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _loadPayrollForDay(DateTime day) async {
    if (!mounted) return;
    setState(() {
      _payrollLoading = true;
    });

    try {
      final summary = await widget.service.getPayrollSummary(
        user: widget.user,
        referenceDate: day,
      );
      if (!mounted) {
        return;
      }
      setState(() {
        _payrollSummary = summary;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Gagal memuat payroll: $error')));
    } finally {
      if (mounted) {
        setState(() {
          _payrollLoading = false;
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
        userRole: widget.user.role,
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

  // Future<void> _openAttendancePopup(DateTime date) async {
  //   final dayEntries = _attendanceForDay(date);

  //   if (!mounted) return;
  //   await showModalBottomSheet<void>(
  //     context: context,
  //     isScrollControlled: true,
  //     builder: (sheetContext) {
  //       return Padding(
  //         padding: EdgeInsets.only(
  //           left: 20,
  //           right: 20,
  //           top: 20,
  //           bottom: MediaQuery.of(sheetContext).viewInsets.bottom + 20,
  //         ),
  //         child: Column(
  //           mainAxisSize: MainAxisSize.min,
  //           crossAxisAlignment: CrossAxisAlignment.start,
  //           children: [
  //             Text(
  //               'Riwayat Kehadiran ${DateFormat('dd MMM yyyy').format(date)}',
  //               style: Theme.of(context).textTheme.titleLarge,
  //             ),
  //             const SizedBox(height: 12),
  //             if (dayEntries.isEmpty)
  //               const Text('Belum ada data kehadiran pada tanggal ini.')
  //             else
  //               ...dayEntries.map(
  //                 (entry) => ListTile(
  //                   dense: true,
  //                   contentPadding: EdgeInsets.zero,
  //                   leading: const Icon(Icons.schedule),
  //                   title: Text(
  //                     'Masuk: ${DateFormat('HH:mm').format(entry.clockIn)}',
  //                   ),
  //                   subtitle: Text(
  //                     entry.clockOut == null
  //                         ? 'Belum clock out'
  //                         : 'Keluar: ${DateFormat('HH:mm').format(entry.clockOut!)}',
  //                   ),
  //                 ),
  //               ),
  //             const SizedBox(height: 12),
  //             Align(
  //               alignment: Alignment.centerRight,
  //               child: TextButton(
  //                 onPressed: () => Navigator.of(sheetContext).pop(),
  //                 child: const Text('Tutup'),
  //               ),
  //             ),
  //           ],
  //         ),
  //       );
  //     },
  //   );
  // }

  String _formatPayrollRange(PayrollSummaryEntry? summary) {
    if (summary == null ||
        summary.periodStart == null ||
        summary.periodEnd == null) {
      return '-';
    }

    return '${DateFormat('dd MMM yyyy').format(summary.periodStart!)} - ${DateFormat('dd MMM yyyy').format(summary.periodEnd!)}';
  }

  Widget _buildPayrollCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Payroll Bulan Ini',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'Tanggal terpilih: ${DateFormat('dd MMM yyyy').format(_selectedDay)}',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 12),
            if (_payrollLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (_payrollSummary == null)
              const Text('Belum ada data payroll untuk tanggal ini.')
            else ...[
              Row(
                children: [
                  Chip(
                    label: Text(
                      _payrollSummary!.hasPayroll
                          ? 'Payroll sudah diberikan'
                          : 'Belum ada payroll',
                    ),
                    backgroundColor: _payrollSummary!.hasPayroll
                        ? Colors.green.shade100
                        : Colors.grey.shade200,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Periode: ${_formatPayrollRange(_payrollSummary)}',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 4),
              Text(
                'Total gaji: ${NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(_payrollSummary!.totalIncome)}',
              ),
              const SizedBox(height: 12),
              if (_payrollSummary!.breakdown.isNotEmpty)
                ..._payrollSummary!.breakdown.map(
                  (item) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    dense: true,
                    title: Text(item.label),
                    subtitle: Text(item.note ?? item.source),
                    trailing: Text(
                      '${item.type == 'deduction' ? '-' : '+'}${NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(item.amount)}',
                    ),
                  ),
                )
              else
                const Text('Tidak ada rincian payroll untuk periode ini.'),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _openRequestForm({
    required RequestType type,
    required DateTime date,
  }) async {
    final descriptionController = TextEditingController();
    final amountController = TextEditingController();

    if (!mounted) return;
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

                  _buildPayrollCard(),
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

                          // --- KONTROL HAK AKSES DEPARTEMEN ---
                          if (widget.user.role == 'Admin' &&
                              _departments.isNotEmpty)
                            DropdownButtonFormField<String>(
                              initialValue:
                                  _departments.any(
                                    (d) => d.id == _selectedDepartmentId,
                                  )
                                  ? _selectedDepartmentId
                                  : _departments.first.id,
                              decoration: const InputDecoration(
                                labelText: 'Pilih Departemen',
                                border: OutlineInputBorder(),
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
                            )
                          else
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.blue.shade50,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.blue.shade200),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.business,
                                    color: Colors.blue,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'Departemen Anda',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.blueGrey,
                                          ),
                                        ),
                                        Text(
                                          widget.user.departmentName,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Chip(
                                    label: Text(widget.user.role),
                                    backgroundColor:
                                        widget.user.role == 'Manager'
                                        ? Colors.amber.shade100
                                        : Colors.green.shade100,
                                  ),
                                ],
                              ),
                            ),

                          const SizedBox(height: 20),

                          // --- CUSTOM HEADER DENGAN NAVIGASI BULAN & DROPDOWN MODE ---
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.chevron_left),
                                    onPressed: () {
                                      setState(() {
                                        _focusedDay = DateTime(
                                          _focusedDay.year,
                                          _focusedDay.month - 1,
                                          1,
                                        );
                                      });
                                      _loadLeavesForMonth(_focusedDay);
                                    },
                                  ),
                                  _buildMonthYearText(),
                                  IconButton(
                                    icon: const Icon(Icons.chevron_right),
                                    onPressed: () {
                                      setState(() {
                                        _focusedDay = DateTime(
                                          _focusedDay.year,
                                          _focusedDay.month + 1,
                                          1,
                                        );
                                      });
                                      _loadLeavesForMonth(_focusedDay);
                                    },
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),

                          TableCalendar<LeaveEntry>(
                            headerVisible: false,
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
                              _loadPayrollForDay(selectedDay);
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
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              decoration: TextDecoration.underline,
            ),
          ),
        ),
        const Text(
          " ",
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        InkWell(
          onTap: _showYearPicker,
          child: Text(
            DateFormat('yyyy').format(_focusedDay),
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              decoration: TextDecoration.underline,
            ),
          ),
        ),
      ],
    );
  }

  void _handleDaySelection(DateTime selectedDay) {
    _openDayDetailsPopup(selectedDay);
  }

  Future<void> _openDayDetailsPopup(DateTime date) async {
    // Ambil data kehadiran user login dan data cuti departemen pada tanggal tersebut
    final attendanceEntries = _attendanceForDay(date);
    final leaveEntries = _entriesForDay(date);

    if (!mounted) return;
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
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
                'Detail Tanggal ${DateFormat('dd MMM yyyy').format(date)}',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const Divider(height: 24),

              // --- BAGIAN 1: RIWAYAT KEHADIRAN USER LOGIN ---
              const Text(
                'Riwayat Kehadiran Anda',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 8),
              if (attendanceEntries.isEmpty)
                const Text('Belum ada data kehadiran pada tanggal ini.')
              else
                ...attendanceEntries.map(
                  (entry) => ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.schedule, color: Colors.blue),
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

              const SizedBox(height: 16),

              // --- BAGIAN 2: DAFTAR CUTI DEPARTEMEN ---
              const Text(
                'Cuti Departemen',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 8),
              if (leaveEntries.isEmpty)
                const Text(
                  'Tidak ada rekan departemen yang cuti pada tanggal ini.',
                )
              else
                ...leaveEntries.map(
                  (entry) => ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.event_busy, color: Colors.orange),
                    title: Text(entry.employeeName),
                  ),
                ),

              const SizedBox(height: 24),

              // --- BAGIAN 3: TOMBOL REQUEST CUTI & REIMBURSE ---
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.of(sheetContext).pop(); // Tutup popup dulu
                        _openRequestForm(type: RequestType.leave, date: date);
                      },
                      icon: const Icon(Icons.beach_access, size: 18),
                      label: const Text(
                        'Request Cuti',
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12), // Jarak antar tombol
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.of(sheetContext).pop(); // Tutup popup dulu
                        _openRequestForm(
                          type: RequestType.reimburse,
                          date: date,
                        );
                      },
                      icon: const Icon(Icons.receipt_long, size: 18),
                      label: const Text(
                        'Reimburse',
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  // KODE INI SUDAH SEMPURNA, TIDAK PERLU DIUBAH LAGI
  Widget _buildQrCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('QR Absensi', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            Center(
              child: _qrData.isEmpty
                  ? const SizedBox(
                      height: 150,
                      width: 150,
                      child: Center(child: CircularProgressIndicator()),
                    )
                  // Jika teks diawali "ERROR", tampilkan pesan merah
                  : _qrData.startsWith('ERROR')
                  ? Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        _qrData, // Menampilkan error spesifik dari backend
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    )
                  : QrImageView(
                      data: _qrData,
                      version: QrVersions.auto,
                      size: 200.0,
                      gapless: true,
                      backgroundColor: Colors.white,
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
