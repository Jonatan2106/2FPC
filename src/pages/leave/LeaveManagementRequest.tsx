import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { leaveApi } from "../../services/api";

const LeaveRequest: React.FC = () => {
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  const [reason, setReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      setError("Please select leave dates");
      return;
    }

    if (endDate.isBefore(startDate)) {
      setError("End date must be after start date");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await leaveApi.createLeaveRequest(
        startDate.format("YYYY-MM-DD"),
        endDate.format("YYYY-MM-DD"),
        reason
      );

      if (response.message && response.message.includes("success")) {
        setSuccess(true);
        setStartDate(null);
        setEndDate(null);
        setReason("");
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(response.message || "Failed to submit leave request");
      }
    } catch (err) {
      setError("An error occurred while submitting leave request");
      console.error(err);
    } finally {
      setLoading(false);
    }
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

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Leave request submitted successfully!</Alert>}

          {/* Start Date */}
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
            disabled={loading}
          />

          {/* End Date */}
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
            disabled={loading}
          />

          {/* Reason */}
          <TextField
            label="Reason (optional)"
            multiline
            rows={3}
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
          />

          {/* Submit */}
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Submit Leave Request"}
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