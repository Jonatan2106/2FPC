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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
        backgroundColor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      {/* Box ini khusus untuk padding dan alignment konten di bawah Navbar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexGrow: 1,
          px: { xs: 2, sm: 3 },
          py: { xs: 3, md: 5 },
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1100 }}>
          {/* Title */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700} color="#0f172a" gutterBottom>
              Reimburse Requests 💳
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review, approve, or reject staff reimbursement claims
            </Typography>
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
            <>
              {/* Table Container */}
              <Box
                sx={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 3,
                  overflow: "auto",
                  maxHeight: "65vh",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  position: "relative",
                }}
                className="hide-scrollbar"
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                      <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Staff</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Evidence</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Created At</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Updated At</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: "#475569" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {data.map((r) => (
                      <TableRow
                        key={r.reimburse_id}
                        hover
                        sx={{ cursor: "pointer", "&:last-child td": { borderBottom: 0 } }}
                        onClick={() => setSelected(r)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#0f172a">
                            {r.user?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {r.user?.departement ?? ''}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ color: "#475569", fontWeight: 500 }}>
                          {Number.isFinite(Number(r.amount)) && Number(r.amount) > 0
                            ? `Rp ${Number(r.amount).toLocaleString("id-ID")}`
                            : "Rp 0"}
                        </TableCell>

                        <TableCell>
                          {r.evidence ? (
                            <img
                              src={r.evidence}
                              alt="evidence"
                              style={{
                                width: 48,
                                height: 48,
                                objectFit: "cover",
                                borderRadius: 8,
                                border: "1px solid #e2e8f0",
                              }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={r.approve ? "APPROVED" : "PENDING"}
                            color={r.approve ? "success" : "warning"}
                            size="small"
                            sx={{ fontWeight: 500, borderRadius: 1.5 }}
                          />
                        </TableCell>

                        <TableCell sx={{ color: "#475569" }}>{formatDate(r.createdAt)}</TableCell>

                        <TableCell sx={{ color: "#475569" }}>{formatDate(r.updatedAt)}</TableCell>

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
                                  startIcon={<CheckCircleIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(r.reimburse_id);
                                  }}
                                  disabled={actionLoading}
                                  sx={{
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    textTransform: "none",
                                    bgcolor: "#16a34a",
                                    boxShadow: "none",
                                    "&:hover": { bgcolor: "#15803d", boxShadow: "none" },
                                  }}
                                >
                                  Approve
                                </Button>

                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<CancelIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject(r.reimburse_id);
                                  }}
                                  disabled={actionLoading}
                                  sx={{
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    textTransform: "none",
                                    borderColor: "#fca5a5",
                                    "&:hover": { borderColor: "#dc2626", bgcolor: "#fef2f2" },
                                  }}
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected(r);
                              }}
                              sx={{
                                borderRadius: 2,
                                fontWeight: 600,
                                textTransform: "none",
                                borderColor: "#cbd5e1",
                                color: "#0f172a",
                                "&:hover": { borderColor: "#2563eb", bgcolor: "#eff6ff" },
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
                PaperProps={{
                  sx: { width: { xs: "100%", sm: 420 }, p: 4, backgroundColor: "#ffffff" }
                }}
              >
                {selected && (
                  <Box display="flex" flexDirection="column" gap={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h5" fontWeight={700} color="#0f172a">
                        Reimburse Details
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        REIMBURSE ID
                      </Typography>
                      <Typography variant="body2" fontWeight={500} color="#0f172a" sx={{ wordBreak: "break-all" }}>
                        {selected.reimburse_id}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        STAFF MEMBER
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="#0f172a">
                        {selected.user?.name ?? selected.user_id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selected.user?.departement ?? ''}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} gutterBottom display="block">
                        STATUS
                      </Typography>
                      <Chip
                        label={selected.approve ? "APPROVED" : "PENDING"}
                        color={selected.approve ? "success" : "warning"}
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: 1.5 }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} gutterBottom display="block">
                        AMOUNT CLAIMED
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#0f172a">
                        {Number.isFinite(Number(selected.amount)) && Number(selected.amount) > 0
                          ? `Rp ${Number(selected.amount).toLocaleString("id-ID")}`
                          : "Rp 0"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} gutterBottom display="block">
                        EVIDENCE DOCUMENT
                      </Typography>
                      {selected.evidence ? (
                        <Box
                          component="img"
                          src={selected.evidence}
                          alt="evidence"
                          sx={{
                            width: "100%",
                            maxHeight: 300,
                            objectFit: "contain",
                            mt: 1,
                            borderRadius: 2,
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#f1f5f9",
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </Drawer>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ReimburseList;