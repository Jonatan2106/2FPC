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
} from "@mui/material";

import type { LeaveManagements } from "../../types/leave_management";

const LeaveManagement: React.FC = () => {
  const [data, setData] = React.useState<LeaveManagements[]>([]);
  const [selected, setSelected] = React.useState<LeaveManagements | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [actionLoading, setActionLoading] = React.useState(false);

  const API_BASE_URL = "http://localhost:8080/api/web";

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
  });

  React.useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/leave-requests`, {
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
        bgcolor: "#ffffff",
        display: "flex",
        justifyContent: "center",
        px: 2,
        py: 4,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1000 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Leave Requests
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#fafafa" }}>
                    <TableCell><b>Staff ID</b></TableCell>
                    <TableCell><b>Reason</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                    <TableCell><b>Created At</b></TableCell>
                    <TableCell><b>Approved At</b></TableCell>
                    <TableCell align="right"><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {data.map((l) => (
                    <TableRow
                      key={l.leave_id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => setSelected(l)}
                    >
                      <TableCell>{l.user_id}</TableCell>

                      <TableCell>
                        {l.reason || "-"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={l.cuti ? "APPROVED" : "PENDING"}
                          color={
                            l.cuti
                              ? "success"
                              : "warning"
                          }
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        {new Date(l.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        {l.approvedAt
                          ? new Date(l.approvedAt).toLocaleDateString()
                          : "-"}
                      </TableCell>

                      <TableCell align="right">
                        {!l.cuti && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              sx={{ mr: 1 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(l.leave_id);
                              }}
                              disabled={actionLoading}
                            >
                              Approve
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(l.leave_id);
                              }}
                              disabled={actionLoading}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        <Button
                          size="small"
                          sx={{ ml: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(l);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Drawer
              anchor="right"
              open={!!selected}
              onClose={() => setSelected(null)}
            >
              <Box sx={{ width: 400, p: 3 }}>
                {selected && (
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Typography variant="h6">Leave Details</Typography>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Leave ID
                      </Typography>
                      <Typography>{selected.leave_id}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Staff ID
                      </Typography>
                      <Typography>{selected.user_id}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Status
                      </Typography>
                      <Chip
                        label={selected.cuti ? "APPROVED" : "PENDING"}
                        color={
                          selected.cuti
                            ? "success"
                            : "warning"
                        }
                        size="small"
                      />
                    </Box>
                    {selected.reason && (
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Reason
                        </Typography>
                        <Typography>{selected.reason}</Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Created At
                      </Typography>
                      <Typography>{new Date(selected.createdAt).toLocaleString()}</Typography>
                    </Box>
                    {selected.approvedAt && (
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Approved At
                        </Typography>
                        <Typography>{new Date(selected.approvedAt).toLocaleString()}</Typography>
                      </Box>
                    )}
                    {!selected.cuti && (
                      <Box mt={3} display="flex" gap={1}>
                        <Button
                          variant="contained"
                          onClick={() => handleApprove(selected.leave_id)}
                          disabled={actionLoading}
                        >
                          Approve
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleReject(selected.leave_id)}
                          disabled={actionLoading}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Drawer>
          </>
        )}
      </Box>
    </Box>
  );
};

export default LeaveManagement;