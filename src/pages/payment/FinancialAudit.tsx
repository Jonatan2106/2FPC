import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Navbar from '../../common/Navbar';

// --- TYPES ---
type Penerima = {
  staff_name: string;
  amount: number;
  pay_date: string;
};

type AuditRecord = {
  admin_id: string;
  admin_name: string;
  total_disalurkan: number;
  penerima: Penerima[];
};

type AuditResponse = {
  total_divisi_keuangan: number;
  details: AuditRecord[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const FinancialAudit: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const API_BASE_URL = `${BASE_URL}/api/web`;

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  // Fungsi untuk mengambil data audit dari backend
  const fetchAuditData = async () => {
    setLoading(true);
    setError('');
    setAuditData(null);

    try {
      // Pastikan Anda membuat endpoint /admin/audit/payroll di backend Node.js
      const response = await fetch(
        `${API_BASE_URL}/admin/audit/payroll?month=${selectedMonth}&year=${selectedYear}`,
        { headers: getHeaders() }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memuat data audit');
      }

      setAuditData(result.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan jaringan';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Otomatis fetch data ketika bulan atau tahun diubah
  useEffect(() => {
    fetchAuditData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  // Generate list tahun (misal: 3 tahun ke belakang & 1 tahun ke depan)
  const years = Array.from(new Array(5), (index) => currentYear - 3 + index);
  
  const months = [
    { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
    { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' }, { value: 12, label: 'Desember' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 2, md: 4 } }}>
      <Navbar />
      <Box sx={{ maxWidth: 900, mx: 'auto', mt: 2 }}>
        
        {/* HEADER & FILTER */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={700} color="#0f172a" align="center">
            AUDIT KEUANGAN 📊
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 1, mb: 3 }}>
            Pilih periode untuk melihat laporan pengeluaran gaji dan riwayat admin yang melakukan pembayaran.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <TextField
              select
              label="Bulan"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              sx={{ minWidth: 150 }}
            >
              {months.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Tahun"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              sx={{ minWidth: 120 }}
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : auditData ? (
          <>
            {/* TOTAL KESELURUHAN */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600} color="#1e3a8a">
                Total Uang Keluar (Divisi Keuangan)
              </Typography>
              <Typography variant="h3" fontWeight={800} color="#1d4ed8" mt={1}>
                {formatCurrency(auditData.total_divisi_keuangan)}
              </Typography>
            </Paper>

            {/* RINCIAN PER ADMIN (ACCORDION) */}
            <Typography variant="h6" fontWeight={700} color="#0f172a" mb={2}>
              Rincian Penyaluran per Admin
            </Typography>

            {auditData.details.length > 0 ? (
              auditData.details.map((record) => (
                <Accordion key={record.admin_id} elevation={0} sx={{ border: '1px solid #e2e8f0', mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2, alignItems: 'center' }}>
                      <Typography fontWeight={600}>{record.admin_name}</Typography>
                      <Typography fontWeight={700} color="success.main">
                        {formatCurrency(record.total_disalurkan)}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', p: 0 }}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Staf Penerima</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Tanggal Pembayaran</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Nominal Ditransfer</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {record.penerima.map((p, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{p.staff_name}</TableCell>
                              <TableCell>{new Date(p.pay_date).toLocaleDateString('id-ID')}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(p.amount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                <Typography color="text.secondary">Belum ada riwayat pembayaran gaji pada periode ini.</Typography>
              </Paper>
            )}
          </>
        ) : null}
      </Box>
    </Box>
  );
};

export default FinancialAudit;