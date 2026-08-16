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
  CircularProgress,
  Alert,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';

import type { User } from "../../types/user";
import Navbar from "../../common/Navbar";
import { useAuth } from "../../context/AuthContext"; // <-- Tambahkan import ini

const AdminUsersPage: React.FC = () => {
  const [data, setData] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  
  // <-- Ambil data user yang sedang login saat ini
  const { user: currentUser } = useAuth(); 

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const API_BASE_URL = `${BASE_URL}/api/web`;

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/admin/users`, {
          method: "GET",
          headers: getHeaders(),
        });

        if (!response.ok) {
          setError("Failed to fetch users");
          return;
        }

        const result = await response.json();
        setData(result.data || []);
        setError("");
      } catch (err) {
        setError("An error occurred while fetching users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700} color="#0f172a" gutterBottom>
              User Management 👥
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage all system users, roles, and assignments
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
            <Box
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                overflow: "hidden",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Salary</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: "#475569" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {data.map((user: any) => {
                    const staff = user.staff_detail;

                    // --- LOGIKA PENGAMANAN SUPER ADMIN ---
                    // 1. Deteksi apakah baris ini adalah baris milik Super Admin (berdasarkan email atau nama)
                    const isTargetSuperAdmin = user.email === "super.admin@company.local" || user.name === "Super Admin";
                    
                    // 2. Deteksi apakah yang sedang login saat ini adalah si Super Admin itu sendiri
                    const isMeSuperAdmin = currentUser?.email === "super.admin@company.local" || currentUser?.name === "Super Admin";
                    
                    // 3. Tombol edit aktif JIKA yang diedit BUKAN Super Admin, ATAU jika yang sedang login adalah Super Admin.
                    const canEdit = !isTargetSuperAdmin || isMeSuperAdmin;
                    // -------------------------------------

                    return (
                      <TableRow key={user.user_id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                        <TableCell sx={{ fontWeight: 500, color: "#0f172a" }}>{user.name}</TableCell>
                        <TableCell sx={{ color: "#475569" }}>{user.email}</TableCell>

                        <TableCell>
                          <Chip
                            label={user.type}
                            color={user.type === "Admin" ? "primary" : "default"}
                            size="small"
                            sx={{ fontWeight: 500, borderRadius: 1.5 }}
                          />
                        </TableCell>

                        <TableCell>
                          {staff?.role ? (
                            <Chip
                              label={staff.role}
                              color={staff.role === "Manager" ? "success" : "default"}
                              size="small"
                              sx={{ fontWeight: 500, borderRadius: 1.5 }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>

                        <TableCell sx={{ color: "#475569" }}>
                          {staff?.departement_data?.company_name || staff?.departement_name || "-"}
                        </TableCell>

                        <TableCell sx={{ color: "#475569" }}>{user.salary ?? "-"}</TableCell>

                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<EditIcon />}
                            disabled={!canEdit} // <-- Disable tombol jika tidak punya izin
                            onClick={() =>
                              window.location.href = `/users/${user.user_id}`
                            }
                            sx={{
                              borderRadius: 2,
                              fontWeight: 600,
                              textTransform: "none",
                              bgcolor: canEdit ? "#2563eb" : "#e2e8f0",
                              color: canEdit ? "#fff" : "#94a3b8",
                              boxShadow: "none",
                              "&:hover": { 
                                bgcolor: canEdit ? "#1d4ed8" : "#e2e8f0", 
                                boxShadow: "none" 
                              },
                            }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminUsersPage;