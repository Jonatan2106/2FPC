import React from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Drawer,
  CircularProgress,
  Alert,
  Card,
  TableContainer,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";

import type { LeaveManagements } from "../../types/leave_management";
import Navbar from "../../common/Navbar";

const LeaveManagement: React.FC = () => {
  const [data, setData] = React.useState<LeaveManagements[]>([]);
  const [selected, setSelected] = React.useState<LeaveManagements | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [actionLoading, setActionLoading] = React.useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const API_BASE_URL = `${BASE_URL}/api/web`;

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
  });

  React.useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/all-leave-requests`, {
          method: "GET",
          headers: getHeaders(),
        });

        if (!response.ok) {
          setError("Failed to fetch leave requests");
          setLoading(false);
          return;
        }

        const result = await response.json();
        setData(result.data || []);
        setError("");
      } catch (err) {
        setError("An error occurred while fetching leave requests");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, []);

  const handleApprove = async (id: string) => {
    if (actionLoading) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/manager/leave-requests/${id}/decision`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ approve: true }),
      });

      const result = await response.json();

      if (response.ok || result.message) {
        setData((prev) =>
          prev.map((item) =>
            item.leave_id === id
              ? { ...item, cuti: true, approvedAt: new Date(), updatedAt: new Date() }
              : item
          )
        );
        setSelected(null);
      } else {
        setError(result.message || "Failed to approve leave request");
      }
    } catch (err) {
      setError("An error occurred while approving leave request");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (actionLoading) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/manager/leave-requests/${id}/decision`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ approve: false }),
      });

      const result = await response.json();

      if (response.ok || result.message) {
        setData((prev) =>
          prev.map((item) =>
            item.leave_id === id
              ? { ...item, cuti: false, approvedAt: new Date(), updatedAt: new Date() }
              : item
          )
        );
        setSelected(null);
      } else {
        setError(result.message || "Failed to reject leave request");
      }
    } catch (err) {
      setError("An error occurred while rejecting leave request");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      <Box
        sx={{
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
          px: { xs: 2, sm: 3 },
          py: 4,
          flex: 1,
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} color="#0f172a">
              Leave Management 🌴
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Review and manage employee leave requests.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => (window.location.href = "/leave-view")}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#2563eb",
              boxShadow: "none",
              "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
            }}
          >
            View Approved Leaves
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress sx={{ color: "#2563eb" }} />
          </Box>
        ) : (
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
              overflow: "hidden",
            }}
          >
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>Staff</TableCell>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>Reason</TableCell>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>Status</TableCell>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>Created At</TableCell>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>Approved At</TableCell>
                    <TableCell align="right" sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {data.length > 0 ? (
                    data.map((l) => (
                      <TableRow
                        key={l.leave_id}
                        hover
                        sx={{ cursor: "pointer", "&:hover": { bgcolor: "#f8fafc" } }}
                        onClick={() => setSelected(l)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#0f172a">
                            {l.user?.name ?? l.user_id}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {l.user?.departement ?? "-"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {l.reason || "-"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={l.cuti ? "APPROVED" : "PENDING"}
                            color={l.cuti ? "success" : "warning"}
                            size="small"
                            sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: "0.7rem" }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(l.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {l.approvedAt ? new Date(l.approvedAt).toLocaleDateString() : "-"}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
                            {!l.cuti && (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleApprove(l.leave_id)}
                                  disabled={actionLoading}
                                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, boxShadow: "none" }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => handleReject(l.leave_id)}
                                  disabled={actionLoading}
                                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setSelected(l)}
                              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, borderColor: "#cbd5e1", color: "#334155" }}
                            >
                              View
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          No leave requests found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Detail Drawer */}
        <Drawer
          anchor="right"
          open={!!selected}
          onClose={() => setSelected(null)}
          PaperProps={{
            sx: { width: { xs: "100%", sm: 420 }, p: 3, boxSizing: "border-box" },
          }}
        >
          {selected && (
            <Box display="flex" flexDirection="column" gap={3} height="100%">
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700} color="#0f172a">
                  Leave Details
                </Typography>
                <IconButton size="small" onClick={() => setSelected(null)}>
                  <Close fontSize="small" />
                </IconButton>
              </Box>

              <Box display="flex" flexDirection="column" gap={2.5} flex={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    LEAVE ID
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#0f172a">
                    {selected.leave_id}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    STAFF INFORMATION
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="#0f172a">
                    {selected.user?.name ?? selected.user_id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selected.user?.departement ?? "No Department"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    STATUS
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selected.cuti ? "APPROVED" : "PENDING"}
                      color={selected.cuti ? "success" : "warning"}
                      size="small"
                      sx={{ borderRadius: 1.5, fontWeight: 600 }}
                    />
                  </Box>
                </Box>

                {selected.reason && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      REASON
                    </Typography>
                    <Typography variant="body2" color="#0f172a" sx={{ mt: 0.5, p: 1.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                      {selected.reason}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TIMELINE
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Created: {new Date(selected.createdAt).toLocaleString()}
                  </Typography>
                  {selected.approvedAt && (
                    <Typography variant="body2" color="text.secondary">
                      Decision Date: {new Date(selected.approvedAt).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              </Box>

              {!selected.cuti && (
                <Box display="flex" gap={2} pt={2} borderTop="1px solid #e2e8f0">
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={() => handleApprove(selected.leave_id)}
                    disabled={actionLoading}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, boxShadow: "none" }}
                  >
                    Approve
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={() => handleReject(selected.leave_id)}
                    disabled={actionLoading}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                  >
                    Reject
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Drawer>
      </Box>
    </Box>
  );
};

export default LeaveManagement;