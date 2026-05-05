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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const Payroll: React.FC = () => {
  const [staffName, setStaffName] = useState('');
  const [payrollData, setPayrollData] = useState<any>(null);
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
        body: JSON.stringify({ name: staffName.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate payroll');
      }

      setPayrollData(result.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating payroll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff', p: { xs: 2, md: 4 } }}>
      <Navbar />
      <Box sx={{ maxWidth: 1080, mx: 'auto' }}>
        <Stack spacing={2} mb={3}>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Payroll
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
            Calculate staff salary automatically and view the payment date. Enter staff name, base salary, penalty, reimbursement, and leave to see the net salary amount.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 3,
          }}
        >
          <Box>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(145, 158, 171, 0.24)',
                borderRadius: 3,
                p: 3,
              }}
            >
              <Stack spacing={3}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Staff Details
                </Typography>

                <TextField
                  label="Staff Name"
                  value={staffName}
                  onChange={(event) => setStaffName(event.target.value)}
                  fullWidth
                />

                <TextField
                  label="Payment Date"
                  type="date"
                  value={payDate}
                  onChange={(event) => setPayDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
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

                {error && <Alert severity="error">{error}</Alert>}
              </Stack>
            </Paper>
          </Box>

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
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Payroll Summary
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
