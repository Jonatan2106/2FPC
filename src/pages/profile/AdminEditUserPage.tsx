import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  TextField,
  Container,
  Paper,
  Box,
  CircularProgress,
  Alert,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../common/Navbar";
import type { User } from "../../types/user";

const AdminEditUserPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  const [currentUser, setCurrentUser] = useState<any>(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const API_BASE_URL = `${BASE_URL}/api/web`;

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const storedUserRaw = localStorage.getItem("user");
        if (storedUserRaw) {
          try {
            setCurrentUser(JSON.parse(storedUserRaw));
          } catch {
            // ignore
          }
        }

        const [targetRes, deptRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/users/${id}`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/departements`, { headers: getHeaders() }).catch(() => null),
        ]);

        const targetData = await targetRes.json();

        if (!targetRes.ok) {
          setError("Failed to fetch user");
          return;
        }

        setUser(targetData.data);
        setStaff(targetData.data.staff_detail || null);

        if (deptRes && deptRes.ok) {
          const deptData = await deptRes.json();
          setDepartments(deptData.data || []);
        }
      } catch (err) {
        setError("Error fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Logika Hak Akses
  const u = currentUser as any;
  const isAdmin = u?.type === "Admin";

  // Hanya Admin yang bisa edit Salary dan Type/Role. Manager tidak bisa edit salary.
  const canEditSalary = isAdmin;
  const canEditType = isAdmin;
  const canEditRole = isAdmin;

  const handleUserChange = (field: keyof User, value: any) => {
    if (!user) return;
    setUser({ ...user, [field]: value });
  };

  const handleStaffChange = (field: string, value: any) => {
    if (!staff) return;
    setStaff({ ...staff, [field]: value });
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // 1. Siapkan data user dasar yang akan dikirim.
      // Jika BUKAN Admin, jangan ikutkan 'salary' dan 'type' agar tidak memaksa update data terlarang.
      const userPayload: any = {
        name: user.name,
        email: user.email,
        alamat: user.alamat,
        nomor_telepon: user.nomor_telepon,
        foto: user.foto,
      };

      // Hanya masukkan salary dan type jika yang login adalah Admin
      if (isAdmin) {
        userPayload.salary = user.salary;
        userPayload.type = user.type;
      }

      const userRes = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(userPayload),
      });

      const userData = await userRes.json();

      if (!userRes.ok) {
        setError(userData.message || "Failed to update user");
        return;
      }

      // 2. Jika ada data staff, sesuaikan juga payload-nya
      if (staff) {
        const staffPayload: any = {
          departement_id: staff.departement_id,
          departement_name: staff.departement_name,
        };

        // Hanya masukkan role jika yang login adalah Admin
        if (isAdmin) {
          staffPayload.role = staff.role;
        }

        const staffRes = await fetch(
          `${API_BASE_URL}/admin/staff-details/${id}`,
          {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(staffPayload),
          }
        );

        const staffData = await staffRes.json();

        if (!staffRes.ok) {
          setError(staffData.message || "Failed to update staff");
          return;
        }
      }

      setSuccess("User updated successfully! Redirecting...");
      setEditing(false);

      setTimeout(() => {
        navigate("/management-tree");
      }, 1000);

    } catch (err) {
      setError("Error updating user");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const resData = await res.json();

      if (!res.ok) {
        setError(resData.message || "Failed to delete user and associated records");
        setDeleting(false);
        setOpenDeleteDialog(false);
        return;
      }

      // Jika berhasil, arahkan kembali ke halaman manajemen user
      navigate("/management-tree");
    } catch (err) {
      setError("Error deleting user");
      console.error(err);
      setDeleting(false);
      setOpenDeleteDialog(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;

    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () =>
        setUser({ ...user, foto: reader.result as string });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f8fafc">
        <CircularProgress sx={{ color: "#2563eb" }} />
      </Box>
    );
  }

  if (!user) return null;

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

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexGrow: 1,
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 3, md: 5 },
          boxSizing: "border-box",
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              backgroundColor: "#ffffff",
              borderRadius: 3,
              border: "1px solid #e2e8f0",
            }}
          >
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={700} color="#0f172a" gutterBottom>
                User Profile 👤
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage system user information and credentials
              </Typography>
            </Box>

            {/* Avatar */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
              <Avatar
                src={user.foto || undefined}
                sx={{ width: 96, height: 96, border: "3px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}
              />
              {editing && (
                <Button
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    mt: 2,
                    color: "#2563eb",
                    fontWeight: 600,
                    textTransform: "none",
                    bgcolor: "#eff6ff",
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    "&:hover": { bgcolor: "#dbeafe" },
                  }}
                >
                  Upload Avatar
                  <input hidden type="file" onChange={handleAvatarChange} />
                </Button>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                fullWidth
                label="Name"
                value={user.name}
                onChange={(e) => handleUserChange("name", e.target.value)}
                disabled={!editing}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <TextField
                fullWidth
                label="Email"
                value={user.email}
                onChange={(e) => handleUserChange("email", e.target.value)}
                disabled={!editing}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <TextField
                fullWidth
                label="Address"
                value={user.alamat || ""}
                onChange={(e) => handleUserChange("alamat", e.target.value)}
                disabled={!editing}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <TextField
                fullWidth
                label="Phone"
                value={user.nomor_telepon || ""}
                onChange={(e) => handleUserChange("nomor_telepon", e.target.value)}
                disabled={!editing}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              {/* Field Salary: Hanya bisa diedit oleh Admin */}
              <TextField
                fullWidth
                label="Salary"
                type="number"
                value={user.salary || ""}
                onChange={(e) => handleUserChange("salary", Number(e.target.value))}
                disabled={!editing || !canEditSalary}
                helperText={editing && !canEditSalary ? "Hanya Admin yang dapat mengubah Salary" : ""}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <TextField
                fullWidth
                select
                label="Type"
                value={user.type}
                onChange={(e) => handleUserChange("type", e.target.value)}
                disabled={!editing || !canEditType}
                helperText={editing && !canEditType ? "Hanya Admin yang dapat mengubah Type" : ""}
                InputProps={{ sx: { borderRadius: 2 } }}
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Staff">Staff</MenuItem>
              </TextField>

              {/* Staff Section */}
              {staff && (
                <>
                  <TextField
                    fullWidth
                    select
                    label="Role"
                    value={staff.role}
                    onChange={(e) => handleStaffChange("role", e.target.value)}
                    disabled={!editing || !canEditRole}
                    helperText={editing && !canEditRole ? "Hanya Admin yang dapat mengubah Role" : ""}
                    InputProps={{ sx: { borderRadius: 2 } }}
                  >
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="Staff">Staff</MenuItem>
                  </TextField>

                  <TextField
                    fullWidth
                    select
                    label="Department"
                    value={staff.departement_id || ""}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedDept = departments.find(
                        (d) => d.departement_id === selectedId
                      );
                      const deptName = selectedDept ? selectedDept.company_name : "";
                      setStaff({
                        ...staff,
                        departement_id: selectedId,
                        departement_name: deptName,
                      });
                    }}
                    disabled={!editing}
                    InputProps={{ sx: { borderRadius: 2 } }}
                  >
                    <MenuItem value="">
                      <em>- Tidak Ada Departemen -</em>
                    </MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.departement_id} value={dept.departement_id}>
                        {dept.company_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </>
              )}

              {/* Button Actions Container */}
              <Box display="flex" justifyContent="center" gap={2} mt={1}>
                {editing ? (
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={!saving ? <SaveIcon /> : undefined}
                    size="large"
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: "none",
                      bgcolor: "#2563eb",
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
                    }}
                  >
                    {saving ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Save Changes"}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => setEditing(true)}
                      startIcon={<EditIcon />}
                      size="large"
                      sx={{
                        py: 1.5,
                        px: 3,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: "none",
                        borderColor: "#cbd5e1",
                        color: "#0f172a",
                        "&:hover": { borderColor: "#2563eb", bgcolor: "#eff6ff" },
                      }}
                    >
                      Edit User
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setOpenDeleteDialog(true)}
                      startIcon={<DeleteIcon />}
                      size="large"
                      sx={{
                        py: 1.5,
                        px: 3,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: "none",
                        borderColor: "#f87171",
                        "&:hover": { bgcolor: "#fef2f2", borderColor: "#dc2626" },
                      }}
                    >
                      Delete User
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Dialog Konfirmasi Hapus User */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a" }}>
          Hapus Pengguna Secara Menyeluruh?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "text.secondary" }}>
            Tindakan ini akan menghapus akun pengguna beserta seluruh data terkait di sistem secara permanen. Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            disabled={deleting}
            sx={{ textTransform: "none", color: "text.secondary", fontWeight: 600 }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
            disabled={deleting}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
              bgcolor: "#dc2626",
              boxShadow: "none",
              "&:hover": { bgcolor: "#b91c1c", boxShadow: "none" },
            }}
          >
            {deleting ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Ya, Hapus Permanen"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEditUserPage;