import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Divider,
  InputAdornment,
} from '@mui/material';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const Payroll: React.FC = () => {
  const [staffName, setStaffName] = useState('');
  const [baseSalary, setBaseSalary] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [reimburse, setReimburse] = useState(0);
  const [leaveDays, setLeaveDays] = useState(0);
  const [leaveDeductionPerDay, setLeaveDeductionPerDay] = useState(100000);
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));

  const leaveDeduction = useMemo(
    () => Math.max(0, leaveDays * leaveDeductionPerDay),
    [leaveDays, leaveDeductionPerDay],
  );

  const netSalary = useMemo(
    () => Math.max(0, baseSalary - penalty - leaveDeduction + reimburse),
    [baseSalary, penalty, reimburse, leaveDeduction],
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f7f8fa', p: { xs: 2, md: 4 } }}>
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

                <Divider />

                <Typography variant="subtitle1" fontWeight={700}>
                  Salary Components
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2,
                  }}
                >
                  <Box>
                    <TextField
                      label="Base Salary"
                      type="number"
                      value={baseSalary}
                      onChange={(event) => setBaseSalary(Number(event.target.value) || 0)}
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      label="Reimburse"
                      type="number"
                      value={reimburse}
                      onChange={(event) => setReimburse(Number(event.target.value) || 0)}
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      label="Penalty"
                      type="number"
                      value={penalty}
                      onChange={(event) => setPenalty(Number(event.target.value) || 0)}
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      label="Leave Days"
                      type="number"
                      value={leaveDays}
                      onChange={(event) => setLeaveDays(Number(event.target.value) || 0)}
                      fullWidth
                    />
                  </Box>
                  <Box>
                    <TextField
                      label="Deduction per Leave Day"
                      type="number"
                      value={leaveDeductionPerDay}
                      onChange={(event) => setLeaveDeductionPerDay(Number(event.target.value) || 0)}
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                      }}
                    />
                  </Box>
                </Box>
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

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Staff Name
                  </Typography>
                  <Typography variant="body1">{staffName || '-'} </Typography>
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
                  <Typography variant="body1">{formatCurrency(baseSalary)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Penalty
                  </Typography>
                  <Typography variant="body1">-{formatCurrency(penalty)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Reimburse
                  </Typography>
                  <Typography variant="body1">{formatCurrency(reimburse)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Leave Deduction
                  </Typography>
                  <Typography variant="body1">-{formatCurrency(leaveDeduction)}</Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Net Salary Total
                  </Typography>
                  <Typography variant="h5" fontWeight={700} mt={1}>
                    {formatCurrency(netSalary)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Payroll;
