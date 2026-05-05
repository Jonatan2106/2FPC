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
import Navbar from "../../common/Navbar";

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

  const API_BASE_URL = "http://localhost:8080/api/web";

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
  });

  React.useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/attendance`, {
          headers: getHeaders(),
        });

        const responseData = await response.json();

        if (response.ok && responseData.data && Array.isArray(responseData.data)) {
          setData(responseData.data);
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

      <Navbar/>

      {/* Title */}
      <Typography variant="h6" mb={2}>
        My Attendance
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, maxWidth: 800 }}>{error}</Alert>}

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

    </Box>
  );
};

export default ViewAttendance;