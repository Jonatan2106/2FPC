import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Link,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

const LeaveRequest: React.FC = () => {
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  const [reason, setReason] = React.useState("");

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      alert("Please select leave dates");
      return;
    }

    const payload = {
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      reason,
    };

    console.log("Leave Request:", payload);
    // TODO: call API
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#ffffff",
          px: 2,
        }}
      >
        {/* Branding */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">
            2FPC
          </Typography>
        </Box>

        {/* Form */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography textAlign="center" variant="h6">
            Request Leave
          </Typography>

          {/* Start Date */}
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />

          {/* End Date */}
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />

          {/* Reason */}
          <TextField
            label="Reason (optional)"
            multiline
            rows={3}
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {/* Submit */}
          <Button variant="contained" size="large" onClick={handleSubmit}>
            Submit Leave Request
          </Button>

          <Link href="/dashboard" textAlign="center">
            Back to Dashboard
          </Link>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default LeaveRequest;