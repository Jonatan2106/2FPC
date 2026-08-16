import React, { useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Divider,
  Button,
  Alert,
} from '@mui/material';
import Navbar from '../../common/Navbar';

type PayrollSummary = {
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
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const Payroll: React.FC = () => {
  const [staffName, setStaffName] = useState('');
  const [payrollData, setPayrollData] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const API_BASE_URL = `${BASE_URL}/api/web`;

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  const handleGeneratePayroll = async () => {
    if (!staffName.trim()) {
      setError('Staff name is required');
      return;
    }

    setLoading(true);
    setError('');
    setPayrollData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/payroll/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: staffName.trim(), pay_date: payDate }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate payroll');
      }

      setPayrollData(result.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while generating payroll';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!staffName.trim()) {
      setError('Staff name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/payroll/pay`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ user_id: payrollData?.user_id ?? staffName.trim(), pay_date: payDate }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to mark payroll as paid');
      }

      setPayrollData((current) => ({
        ...current,
        ...result.data,
        payment_status: 'paid',
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while marking payroll as paid';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 2, md: 4 } }}>
      <Navbar />
      <Box sx={{ maxWidth: { xs: '100%', md: 1040, lg: 1180 }, mx: 'auto', mt: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' },
            gap: { xs: 2, md: 3 },
            alignItems: 'stretch',
          }}
        >
          {/* Left column: title + staff details */}
          <Box>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                p: { xs: 2, md: 3 },
                height: '100%',
              }}
            >
              <Stack spacing={3} sx={{ height: '100%' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="#0f172a" align="center">
                    PAYROLL 💰
                  </Typography>
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 1, maxWidth: 720, mx: 'auto' }}>
                    Calculate staff salary automatically and view the payment date. Enter staff name, base salary, penalty, reimbursement, and leave to see the net salary amount.
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} color="#0f172a" mb={1.5}>
                    Staff Details
                  </Typography>

                  <TextField
                    label="Staff Name"
                    value={staffName}
                    onChange={(event) => setStaffName(event.target.value)}
                    fullWidth
                    InputProps={{ sx: { borderRadius: 2 } }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    label="Payment Date"
                    type="date"
                    value={payDate}
                    onChange={(event) => setPayDate(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    InputProps={{ sx: { borderRadius: 2 } }}
                    sx={{ mb: 2.5 }}
                  />

                  <Button
                    variant="contained"
                    onClick={handleGeneratePayroll}
                    disabled={loading}
                    fullWidth
                    size="large"
                    sx={{
                      py: 1.4,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: "none",
                      bgcolor: "#2563eb",
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
                    }}
                  >
                    {loading ? 'Generating...' : 'Generate Payroll'}
                  </Button>

                  {payrollData && payrollData.payment_status !== 'paid' && (
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={handleMarkPaid}
                      disabled={loading}
                      fullWidth
                      size="large"
                      sx={{
                        mt: 1.5,
                        py: 1.4,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: "none",
                      }}
                    >
                      {loading ? 'Processing...' : 'Mark as Paid on 28'}
                    </Button>
                  )}

                  {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}
                </Box>
              </Stack>
            </Paper>
          </Box>

          {/* Right column: payroll summary */}
          <Box>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                p: { xs: 2, md: 3 },
                minHeight: { xs: 280, md: 360 },
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} color="#0f172a" mb={2} align="center">
                PAYROLL SUMMARY
              </Typography>

              {payrollData ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      STAFF NAME
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="#0f172a">{payrollData.staff_name || '-'}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      PAYMENT DATE
                    </Typography>
                    <Typography variant="body1" color="#0f172a">{payDate}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      PAYROLL PERIOD
                    </Typography>
                    <Typography variant="body1" color="#0f172a">{payrollData.payroll_period_label || '-'}</Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      CURRENT SALARY
                    </Typography>
                    <Typography variant="body1" color="#0f172a">{formatCurrency(payrollData.base_salary || 0)}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      PAYMENT STATUS
                    </Typography>
                    <Typography variant="body1" sx={{ color: payrollData.payment_status === 'paid' ? 'success.main' : 'warning.main', fontWeight: 600 }}>
                      {payrollData.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      PENALTY
                    </Typography>
                    <Typography variant="body1" color="error.main">-{formatCurrency(payrollData.total_penalty || 0)}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      REIMBURSE
                    </Typography>
                    <Typography variant="body1" color="success.main">+{formatCurrency(payrollData.total_reimburse || 0)}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      LEAVE DEDUCTION ({payrollData.leave_days || 0} days)
                    </Typography>
                    <Typography variant="body1" color="error.main">-{formatCurrency(payrollData.leave_deduction || 0)}</Typography>
                  </Box>

                  <Divider />

                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      NET SALARY TOTAL
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="#0f172a" mt={0.5}>
                      {formatCurrency(payrollData.final_salary || 0)}
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="240px">
                  <Typography variant="body2" color="text.secondary" align="center">
                    Enter staff name and click Generate Payroll to view summary.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Payroll;