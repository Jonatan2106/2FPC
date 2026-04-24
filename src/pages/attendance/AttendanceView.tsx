import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { attendanceApi } from "../../services/api";

interface AttendanceRecord {
  id: number;
  name: string;
  checkIn: string;
  checkOut: string;
}

const ViewAttendance: React.FC = () => {
  const [data, setData] = React.useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await attendanceApi.getAttendanceData();

        if (response.data && Array.isArray(response.data)) {
          setData(response.data);
        } else {
          // Fallback to mock data if no data returned
          setData([
            {
              id: 1,
              name: "John Doe",
              checkIn: "2026-03-20 08:00",
              checkOut: "2026-03-20 17:00",
            },
          ]);
        }
      } catch (err) {
        setError("An error occurred while fetching attendance data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchAttendance();
  }, []);

  const handleGenerateQr = async () => {
    try {
      const response = await attendanceApi.generateQr();
      // Open QR code in new window or display modal
      if (response.data) {
        window.open(response.data.qrCode, "_blank");
      }
    } catch (err) {
      setError("An error occurred while generating QR code");
      console.error(err);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "#ffffff",
        px: 2,
        py: 4,
      }}
    >
      
      {/* Branding */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          2FPC
        </Typography>
      </Box>

      {/* Title */}
      <Typography variant="h6" mb={2}>
        My Attendance
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, maxWidth: 800 }}>{error}</Alert>}

      {/* Generate QR Button */}
      <Box sx={{ mb: 3 }}>
        <Button variant="outlined" onClick={handleGenerateQr}>
          Generate Check-in QR Code
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Table */}
          <TableContainer
            component={Paper}
            sx={{ width: "100%", maxWidth: 800 }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Check In</b></TableCell>
                  <TableCell><b>Check Out</b></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {data && data.length > 0 ? (
                  data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.checkIn}</TableCell>
                      <TableCell>{row.checkOut}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Back */}
      <Box mt={3}>
        <Link href="/dashboard">Back to Dashboard</Link>
      </Box>
    </Box>
  );
};

export default ViewAttendance;