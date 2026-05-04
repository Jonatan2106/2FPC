import React from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Stack,
  CircularProgress,
} from "@mui/material";
import Navbar from "../../common/Navbar";
import { useParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080/api/web";

const ViewLeave: React.FC = () => {
  const { id: leaveId } = useParams();

  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!leaveId) {
      setError("Leave ID is missing");
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("You are not authenticated");
      return;
    }

    const fetchLeave = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/leave-requests/${leaveId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          setError(result.message || "Failed to fetch leave");
          return;
        }

        // ❗ Guard 3: empty data
        if (!result.data) {
          setError("No leave data found");
          return;
        }

        setData(result.data);
      } catch (err) {
        setError("Something went wrong");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeave();
  }, [leaveId]);

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#ffffff", p: 4 }}>
      <Navbar />

      <Box sx={{ maxWidth: 960, mx: "auto" }}>
        <Paper sx={{ p: 4, border: "1px solid #e5e7eb" }} elevation={0}>
          <Typography variant="h4" fontWeight={700}>
            Leave Request Overview
          </Typography>

          {/* ❗ ERROR STATE */}
          {error && (
            <Typography color="error" mt={2}>
              {error}
            </Typography>
          )}

          {/* ❗ LOADING */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* ❗ NO DATA SAFE CHECK */}
          {!loading && !error && !data && (
            <Typography mt={2} color="text.secondary">
              No leave request selected
            </Typography>
          )}

          {/* DATA */}
          {!loading && !error && data && (
            <Stack spacing={2} mt={3}>
              <Paper sx={{ p: 3, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={700} color="#475569">
                    REQUEST CREATED
                  </Typography>

                  <Chip label="Submitted" size="small" />
                </Stack>

                <Typography variant="h6" fontWeight={600} mt={2}>
                  {formatDate(data.createdAt)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Reason: {data.reason || "-"}
                </Typography>
              </Paper>

              <Paper sx={{ p: 3, border: "1px solid #e5e7eb" }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={700} color="#475569">
                    REQUEST STATUS
                  </Typography>

                  <Chip
                    label={data.cuti ? "Approved" : "Pending"}
                    size="small"
                    color={data.cuti ? "success" : "warning"}
                  />
                </Stack>

                <Typography variant="h6" fontWeight={600} mt={2}>
                  {formatDate(data.approvedAt)}
                </Typography>
              </Paper>
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default ViewLeave;