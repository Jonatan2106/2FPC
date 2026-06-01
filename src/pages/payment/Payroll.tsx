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
  staff_name?: string;
  base_salary?: number;
  total_penalty?: number;
  total_reimburse?: number;
  leave_days?: number;
  leave_deduction?: number;
  final_salary?: number;
  payroll_period_label?: string;
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

  const API_BASE_URL = "http://localhost:8080/api/web";

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

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff', p: { xs: 2, md: 4 } }}>
      <Navbar />
      <Box sx={{ maxWidth: 1080, mx: 'auto'}}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.7fr 1fr' },
            gap: 3,
          }}
        >
          {/* Left column: title + staff details */}
          <Box>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(145, 158, 171, 0.24)',
                borderRadius: 3,
                p: 3,
                height: '100%'
              }}
            >
              <Stack spacing={3} sx={{ height: '100%' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="text.primary" align="center">
                    PAYROLL
                  </Typography>
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 1, maxWidth: 720, mx: 'auto' }}>
                    Calculate staff salary automatically and view the payment date. Enter staff name, base salary, penalty, reimbursement, and leave to see the net salary amount.
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} mb={1}>
                    Staff Details
                  </Typography>

                  <TextField
                    label="Staff Name"
                    value={staffName}
                    onChange={(event) => setStaffName(event.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    label="Payment Date"
                    type="date"
                    value={payDate}
                    onChange={(event) => setPayDate(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    sx={{ mb: 2 }}
                  />

                  <Button
                    variant="contained"
                    onClick={handleGeneratePayroll}
                    disabled={loading}
                    fullWidth
                    size="large"
                  >
                    {loading ? 'Generating...' : 'Generate Payroll'}
                  </Button>

                  {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </Box>
              </Stack>
            </Paper>
          </Box>

          {/* Right column: payroll summary (spans vertically) */}
          <Box>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(145, 158, 171, 0.24)',
                borderRadius: 3,
                p: 3,
                minHeight: 360,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} mb={2} align="center">
                PAYROLL SUMMARY
              </Typography>

              {payrollData ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Staff Name
                    </Typography>
                    <Typography variant="body1">{payrollData.staff_name || '-'} </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Payment Date
                    </Typography>
                    <Typography variant="body1">{payDate}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Payroll Period
                    </Typography>
                    <Typography variant="body1">{payrollData.payroll_period_label || '-'}</Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Base Salary
                    </Typography>
                    <Typography variant="body1">{formatCurrency(payrollData.base_salary || 0)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Penalty
                    </Typography>
                    <Typography variant="body1">-{formatCurrency(payrollData.total_penalty || 0)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Reimburse
                    </Typography>
                    <Typography variant="body1">{formatCurrency(payrollData.total_reimburse || 0)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Leave Deduction ({payrollData.leave_days || 0} days)
                    </Typography>
                    <Typography variant="body1">-{formatCurrency(payrollData.leave_deduction || 0)}</Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Net Salary Total
                    </Typography>
                    <Typography variant="h5" fontWeight={700} mt={1}>
                      {formatCurrency(payrollData.final_salary || 0)}
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Enter staff name and click Generate Payroll to view summary.
                </Typography>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Payroll;
