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

import type { Reimburse } from "../../types/reimburse";

const ReimburseList: React.FC = () => {
  const [data, setData] = React.useState<Reimburse[]>([]);
  const [selected, setSelected] = React.useState<Reimburse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [actionLoading, setActionLoading] = React.useState(false);

  const API_BASE_URL = "http://localhost:8080/api/web";

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
  });

  React.useEffect(() => {
    // Load reimburse data - using mockData for now as backend doesn't have GET endpoint
    // In real scenario, you'd call an API endpoint
    setData([
      {
        reimburse_id: "1",
        amount: 120,
        approve: "PENDING",
        evidence: "https://via.placeholder.com/300",
        user_id: "u1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    setLoading(false);
  }, []);

  const handleApprove = async (id: string) => {
    if (actionLoading) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/manager/reimburse-requests/${id}/decision`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ decision: "approved" }),
      });

      const data = await response.json();

      if (response.message && response.message.includes("success")) {
        setData((prev) =>
          prev.map((item) =>
            item.reimburse_id === id
              ? { ...item, approve: "APPROVED", updatedAt: new Date() }
              : item
          )
        );
        setSelected(null);
      } else {
        setError(response.message || "Failed to approve reimburse request");
      }
    } catch (err) {
      setError("An error occurred while approving reimburse request");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (actionLoading) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/manager/reimburse-requests/${id}/decision`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ decision: "declined" }),
      });

      const data = await response.json();

      if (response.ok && data.message && data.message.includes("success")) {
        setData((prev) =>
          prev.map((item) =>
            item.reimburse_id === id
              ? { ...item, approve: "REJECTED", updatedAt: new Date() }
              : item
          )
        );
        setSelected(null);
      } else {
        setError(data.message || "Failed to reject reimburse request");
      }
    } catch (err) {
      setError("An error occurred while rejecting reimburse request");
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
        {/* Title */}
        <Typography variant="h5" fontWeight={600} mb={3}>
          Reimburse Requests
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Table Container */}
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
                    <TableCell><b>Amount</b></TableCell>
                    <TableCell><b>Evidence</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                    <TableCell><b>Created At</b></TableCell>
                    <TableCell><b>Updated At</b></TableCell>
                    <TableCell align="right"><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {data.map((r) => (
                    <TableRow
                      key={r.reimburse_id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => setSelected(r)}
                    >
                      <TableCell>{r.user_id}</TableCell>

                      <TableCell>${r.amount.toFixed(2)}</TableCell>

                      <TableCell>
                        {r.evidence ? (
                          <img
                            src={r.evidence}
                            alt="evidence"
                            style={{
                              width: 50,
                              height: 50,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={r.approve}
                          color={
                            r.approve === "APPROVED"
                              ? "success"
                              : r.approve === "REJECTED"
                              ? "error"
                              : "warning"
                          }
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        {new Date(r.updatedAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell align="right">
                        {r.approve === "PENDING" && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              sx={{ mr: 1 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(r.reimburse_id);
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
                                handleReject(r.reimburse_id);
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
                            setSelected(r);
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

            {/* DRAWER */}
            <Drawer
              anchor="right"
              open={!!selected}
              onClose={() => setSelected(null)}
            >
              <Box sx={{ width: 400, p: 3 }}>
                {selected && (
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Typography variant="h6">Reimburse Details</Typography>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Reimburse ID
                      </Typography>
                      <Typography>{selected.reimburse_id}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Amount
                      </Typography>
                      <Typography>${selected.amount.toFixed(2)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Status
                      </Typography>
                      <Chip
                        label={selected.approve}
                        color={
                          selected.approve === "APPROVED"
                            ? "success"
                            : selected.approve === "REJECTED"
                            ? "error"
                            : "warning"
                        }
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Evidence
                      </Typography>
                      {selected.evidence && (
                        <img
                          src={selected.evidence}
                          alt="evidence"
                          style={{ width: "100%", marginTop: 8, borderRadius: 8 }}
                        />
                      )}
                    </Box>
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

export default ReimburseList;