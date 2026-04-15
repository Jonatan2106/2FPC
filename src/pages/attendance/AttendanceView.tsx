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
} from "@mui/material";

interface AttendanceRecord {
  id: number;
  name: string;
  checkIn: string;
  checkOut: string;
}

const ViewAttendance: React.FC = () => {
  // Dummy data (nanti ganti dari API)
  const [data] = React.useState<AttendanceRecord[]>([
    {
      id: 1,
      name: "John Doe",
      checkIn: "2026-03-20 08:00",
      checkOut: "2026-03-20 17:00",
    },
    {
      id: 2,
      name: "John Doe",
      checkIn: "2026-03-21 08:15",
      checkOut: "2026-03-21 17:05",
    },
    {
      id: 3,
      name: "John Doe",
      checkIn: "2026-03-22 07:55",
      checkOut: "2026-03-22 16:50",
    },
  ]);

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
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.checkIn}</TableCell>
                <TableCell>{row.checkOut}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Back */}
      <Box mt={3}>
        <Link href="/dashboard">Back to Dashboard</Link>
      </Box>
    </Box>
  );
};

export default ViewAttendance;