import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
} from '@mui/material';
import Navbar from '../../common/Navbar';

// --- TYPES ---
type Departement = { departement_id: string; company_name: string };
type User = { 
  user_id: string; 
  name: string; 
  staff_detail?: {
    departement_id?: string;
  };
};

type PayrollSummary = {
  hasPayroll?: boolean; // Dari backend controller
  user_id?: string;
  staff_name?: string;
  base_salary?: number;
  total_penalty?: number;
  total_reimburse?: number;
  leave_days?: number;
  leave_deduction?: number;
  final_salary?: number;
  payroll_period_label?: string;
  payment_status?: 'paid' | 'unpaid';
  generated_by?: string;
  paid_by?: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const Payroll: React.FC = () => {
  const [departments, setDepartments] = useState<Departement[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [payrolls, setPayrolls] = useState<Record<string, PayrollSummary>>({});
  
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));
  
  const [globalLoading, setGlobalLoading] = useState(false);
  const [rowLoading, setRowLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const API_BASE_URL = `${BASE_URL}/api/web`;

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  // --- 1. INITIAL FETCH (DEPARTMENTS & USERS) ---
  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2. FETCH PAYROLL DATA WHEN DEPT OR DATE CHANGES ---
  useEffect(() => {
    if (selectedDeptId) {
      fetchPayrollForDepartment(selectedDeptId);
    }
  }, [selectedDeptId, payDate]);

  const fetchInitialData = async () => {
    setGlobalLoading(true);
    setError('');
    try {
      // Pastikan backend Anda memiliki endpoint GET /departments dan GET /users
      // Jika URL-nya berbeda, silakan sesuaikan string fetch di bawah ini.
      const [deptRes, userRes] = await Promise.all([
        fetch(`${API_BASE_URL}/departements`, { headers: getHeaders() }).catch(() => null),
        fetch(`${API_BASE_URL}/admin/users`, { headers: getHeaders() }).catch(() => null)
      ]);

      if (deptRes && deptRes.ok) {
        const deptJson = await deptRes.json();
        setDepartments(deptJson.data || []);
      }
      if (userRes && userRes.ok) {
        const userJson = await userRes.json();
        setUsers(userJson.data || []);
      }
    } catch (err: unknown) {
      setError('Gagal memuat data awal departemen dan user.');
    } finally {
      setGlobalLoading(false);
    }
  };

  const fetchPayrollForDepartment = async (deptId: string) => {
    setGlobalLoading(true);
    try {
      const deptUsers = users.filter(u => String(u.staff_detail?.departement_id) === String(deptId));
      const payrollRecords: Record<string, PayrollSummary> = {};

      // Memanggil endpoint GET payroll untuk setiap user di departemen terpilih
      await Promise.all(
        deptUsers.map(async (user) => {
          try {
            const res = await fetch(`${API_BASE_URL}/payroll/summary?user_id=${user.user_id}&reference_date=${payDate}`, {
              headers: getHeaders()
            });
            if (res.ok) {
              const json = await res.json();
              payrollRecords[user.user_id] = json.data;
            }
          } catch (e) {
            console.error(`Gagal memuat payroll untuk ${user.name}`);
          }
        })
      );

      setPayrolls(payrollRecords);
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data payroll departemen.');
    } finally {
      setGlobalLoading(false);
    }
  };

  // --- 3. ACTIONS: GENERATE & PAY ---
  const handleGeneratePayroll = async (user: User) => {
    setRowLoading(prev => ({ ...prev, [user.user_id]: true }));
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/payroll/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: user.name, pay_date: payDate, generate_by: user.user_id }), 
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to generate payroll');

      // Update state untuk row tersebut menjadi generated
      setPayrolls(prev => ({
        ...prev,
        [user.user_id]: { ...result.data, hasPayroll: true }
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error generating payroll';
      setError(`${user.name}: ${message}`);
    } finally {
      setRowLoading(prev => ({ ...prev, [user.user_id]: false }));
    }
  };

  const handleMarkPaid = async (userId: string) => {
    setRowLoading(prev => ({ ...prev, [userId]: true }));
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/payroll/pay`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ user_id: userId, pay_date: payDate }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to mark payroll as paid');

      // Update state untuk row tersebut menjadi paid
      setPayrolls(prev => ({
        ...prev,
        [userId]: { ...prev[userId], ...result.data, payment_status: 'paid' }
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error marking as paid';
      setError(`Gagal memproses pembayaran: ${message}`);
    } finally {
      setRowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // --- RENDER HELPERS ---
  const filteredUsers = users.filter((u) => u.staff_detail?.departement_id === selectedDeptId);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 2, md: 4 } }}>
      <Navbar />
      <Box sx={{ maxWidth: { xs: '100%', md: 1200 }, mx: 'auto', mt: 2 }}>
        
        {/* HEADER SECTION */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3, backgroundColor: '#ffffff' }}>
          <Typography variant="h4" fontWeight={700} color="#0f172a" align="center">
            PAYROLL MANAGEMENT 💰
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 1, mb: 3 }}>
            Pilih departemen untuk melihat status payroll, melakukan generate otomatis, dan mencetak gaji bersih karyawan.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              select
              label="Pilih Departemen"
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              fullWidth
              sx={{ bgcolor: '#fff' }}
              InputProps={{ sx: { borderRadius: 2 } }}
            >
              <MenuItem value="" disabled>
                <em>-- Pilih Departemen --</em>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.departement_id} value={dept.departement_id}>
                  {dept.company_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Tanggal Referensi / Gaji"
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        {/* DATA TABLE SECTION */}
        {/* DATA TABLE SECTION */}
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden', backgroundColor: '#ffffff' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={700} color="#0f172a">
              Daftar Gaji Staf
            </Typography>
            {globalLoading && <Typography variant="caption" color="primary">Memuat data...</Typography>}
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Nama Staf</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status Data</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Gaji Bersih (Net)</TableCell>
                  {/* TAMBAHAN KOLOM INFO PROSES */}
                  <TableCell sx={{ fontWeight: 600 }}>Info Proses</TableCell> 
                  <TableCell sx={{ fontWeight: 600 }} align="center">Aksi / Pembayaran</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const data = payrolls[user.user_id];
                    const isGenerated = data?.hasPayroll === true;
                    const isPaid = data?.payment_status === 'paid';
                    const isLoading = rowLoading[user.user_id] || false;

                    return (
                      <TableRow key={user.user_id} hover>
                        {/* 1. NAMA STAF */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#0f172a">
                            {user.name}
                          </Typography>
                        </TableCell>

                        {/* 2. STATUS GENERATE */}
                        <TableCell>
                          {isGenerated ? (
                            <Chip label="Ready" color="success" size="small" variant="outlined" />
                          ) : (
                            <Chip label="Belum Digenerate" color="warning" size="small" variant="outlined" />
                          )}
                        </TableCell>

                        {/* 3. TOTAL GAJI */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="#0f172a">
                            {isGenerated ? formatCurrency(data?.final_salary || 0) : '-'}
                          </Typography>
                        </TableCell>

                        {/* 4. INFO PROSES (GENERATE & PAID BY) */}
                        <TableCell>
                          {isGenerated ? (
                            <Box>
                              <Typography variant="caption" display="block" color="text.secondary">
                                <b>Gen:</b> {data?.generated_by || 'Sistem'}
                              </Typography>
                              {isPaid && (
                                <Typography variant="caption" display="block" color="success.main">
                                  <b>Paid:</b> {data?.paid_by || 'Sistem'}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">-</Typography>
                          )}
                        </TableCell>

                        {/* 5. TOMBOL AKSI */}
                        <TableCell align="center">
                          {!isGenerated ? (
                            // JIKA BELUM GENERATE
                            <Button
                              variant="outlined"
                              size="small"
                              disabled={isLoading || globalLoading}
                              onClick={() => handleGeneratePayroll(user)}
                              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                            >
                              {isLoading ? 'Generating...' : 'Generate Payroll'}
                            </Button>
                          ) : isPaid ? (
                            // JIKA SUDAH DIBAYAR
                            <Chip label="Done" color="success" sx={{ fontWeight: 700, px: 2 }} />
                          ) : (
                            // JIKA SUDAH GENERATE TAPI BELUM DIBAYAR
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              disabled={isLoading || globalLoading}
                              onClick={() => handleMarkPaid(user.user_id)}
                              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                            >
                              {isLoading ? 'Processing...' : 'Mark as Paid'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    {/* colSpan diubah menjadi 5 karena ada tambahan kolom Info Proses */}
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}> 
                      <Typography variant="body2" color="text.secondary">
                        {selectedDeptId 
                          ? "Tidak ada data staf pada departemen ini." 
                          : "Silakan pilih departemen terlebih dahulu untuk melihat data staf."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

      </Box>
    </Box>
  );
};

export default Payroll;