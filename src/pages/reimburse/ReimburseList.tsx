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
import Navbar from "../../common/Navbar";

const ReimburseList: React.FC = () => {
  const [data, setData] = React.useState<Reimburse[]>([]);
  const [selected, setSelected] = React.useState<Reimburse | null>(null);
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
    const fetchReimburseData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/all-reimburse-requests`, {
          method: "GET",
          headers: getHeaders(),
        });

        if (!response.ok) {
          setError("Failed to fetch reimburse requests");
          setLoading(false);
          return;
        }

        const result = await response.json();
        setData(result.data || []);
        setError("");
      } catch (err) {
        setError("An error occurred while fetching reimburse requests");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReimburseData();
  }, []);

  const handleApprove = async (id: string) => {
    if (actionLoading) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/manager/reimburse-requests/${id}/decision`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ approve: true }),
      });

      const resJson = await response.json();

      if (response.ok) {
        const serverData = resJson.data;
        setData((prev) =>
          prev.map((item) =>
            item.reimburse_id === id
              ? {
                  ...item,
                  approve: true,
                  updatedAt: serverData?.updatedAt ? new Date(serverData.updatedAt) : new Date(),
                }
              : item
          )
        );
        setSelected(null);
      } else {
        setError(resJson.message || "Failed to approve reimburse request");
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
        body: JSON.stringify({ approve: false }),
      });

      const resJson = await response.json();

      if (response.ok) {
        const serverData = resJson.data;
        setData((prev) =>
          prev.map((item) =>
            item.reimburse_id === id
              ? {
                  ...item,
                  approve: false,
                  updatedAt: serverData?.updatedAt ? new Date(serverData.updatedAt) : new Date(),
                }
              : item
          )
        );
        setSelected(null);
      } else {
        setError(resJson.message || "Failed to reject reimburse request");
      }
    } catch (err) {
      setError("An error occurred while rejecting reimburse request");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (value?: Date | string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
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
      <Navbar/>
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
                overflow: "auto",
                maxHeight: "60vh",
                backgroundColor: "#fff",
                position: "relative",
              }}
              className="hide-scrollbar"
            >
              <Table stickyHeader>
                <TableHead sx={{ position: "sticky", top: 0, zIndex: 5 }}>
                  <TableRow sx={{ backgroundColor: "#fafafa", position: 'relative' }}>
                    <TableCell><b>Staff</b></TableCell>
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
                      <TableCell>
                        <div>{r.user?.name}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{r.user?.departement ?? ''}</div>
                      </TableCell>

                    <TableCell>
                      {Number.isFinite(Number(r.amount)) && Number(r.amount) > 0
                        ? Number(r.amount).toLocaleString("id-ID")
                        : "0"}
                    </TableCell>

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
                        label={r.approve ? "APPROVED" : "PENDING"}
                        color={
                          r.approve
                            ? "success"
                            : "warning"
                        }
                      />
                    </TableCell>

                      <TableCell>{formatDate(r.createdAt)}</TableCell>

                      <TableCell>{formatDate(r.updatedAt)}</TableCell>

                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          {!r.approve && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(r);
                            }}
                          >
                            View
                          </Button>
                        </Box>
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
                        Staff
                      </Typography>
                      <Typography>{selected.user?.name ?? selected.user_id}</Typography>
                      <Typography variant="caption" color="text.secondary">{selected.user?.departement ?? ''}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Status
                      </Typography>
                      <Chip
                        label={selected.approve ? "APPROVED" : "PENDING"}
                        color={
                          selected.approve
                            ? "success"
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