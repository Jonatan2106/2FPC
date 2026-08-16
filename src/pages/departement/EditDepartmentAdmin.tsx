import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../common/Navbar";

const EditDepartmentAdmin: React.FC = () => {
  const { id } = useParams(); // Mengambil ID departemen dari URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company_name: "",
    company_email: "",
    password: "",
    address: "",
    website: "",
    logo_url: "",
    description: "",
    industry: "",
  });

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

  // Fetch data departemen saat halaman pertama kali dibuka
  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/departements/${id}`, {
          headers: getHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.message || "Failed to fetch department data");
          return;
        }

        const dept = result.data;
        setFormData({
          company_name: dept.company_name || "",
          company_email: dept.company_email || "",
          password: "", // Kosongkan password demi keamanan
          address: dept.address || "",
          website: dept.website || "",
          logo_url: dept.logo_url || "",
          description: dept.description || "",
          industry: dept.industry || "",
        });
      } catch (err) {
        console.error(err);
        setError("Error loading department data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDepartment();
    }
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Fungsi Simpan / Update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // Filter payload: jangan kirim password jika kosong agar tidak tertimpa string kosong di backend
    const payload: any = { ...formData };
    if (!payload.password) {
      delete payload.password;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/departements/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to update department");
        return;
      }

      setSuccess("Department updated successfully! Redirecting...");
      setTimeout(() => {
        navigate("/management-tree");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("An error occurred while updating department");
    } finally {
      setSaving(false);
    }
  };

  // Fungsi Hapus Departemen
  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/departements/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to delete department");
        setDeleting(false);
        setOpenDeleteDialog(false);
        return;
      }

      navigate("/management-tree");
    } catch (err) {
      console.error(err);
      setError("An error occurred while deleting department");
      setDeleting(false);
      setOpenDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f8fafc">
        <CircularProgress sx={{ color: "#2563eb" }} />
      </Box>
    );
  }

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
          px: { xs: 2, sm: 3 },
          py: { xs: 3, md: 5 },
          boxSizing: "border-box",
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            component="form"
            onSubmit={handleUpdate}
            sx={{
              p: { xs: 3, sm: 4 },
              backgroundColor: "#ffffff",
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            }}
          >
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: "#eff6ff",
                  color: "#2563eb",
                  mb: 2,
                }}
              >
                <BusinessIcon fontSize="large" />
              </Box>
              <Typography variant="h4" fontWeight={700} color="#0f172a" gutterBottom>
                Edit Department 🏢
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Update department details or remove the department node
              </Typography>
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

            <Box display="flex" flexDirection="column" gap={2.5}>
              <TextField
                fullWidth
                required
                label="Company / Department Name"
                value={formData.company_name}
                onChange={(e) => handleChange("company_name", e.target.value)}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <TextField
                fullWidth
                required
                type="email"
                label="Company Email"
                value={formData.company_email}
                onChange={(e) => handleChange("company_email", e.target.value)}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <TextField
                fullWidth
                type="password"
                label="Password (Kosongkan jika tidak diubah)"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <TextField
                fullWidth
                label="Industry"
                value={formData.industry}
                onChange={(e) => handleChange("industry", e.target.value)}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              {/* Tombol Aksi: Save Changes & Delete Department */}
              <Box display="flex" gap={2} mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={!saving ? <SaveIcon /> : undefined}
                  size="large"
                  sx={{
                    py: 1.5,
                    flex: 1,
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

                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  disabled={deleting}
                  onClick={() => setOpenDeleteDialog(true)}
                  startIcon={<DeleteIcon />}
                  size="large"
                  sx={{
                    py: 1.5,
                    flex: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: "none",
                    borderColor: "#f87171",
                    "&:hover": { bgcolor: "#fef2f2", borderColor: "#dc2626" },
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Dialog Konfirmasi Hapus Departemen */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a" }}>
          Hapus Departemen Ini?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "text.secondary" }}>
            Tindakan ini akan menghapus departemen dari sistem secara permanen. Pastikan tidak ada staff yang masih terikat di departemen ini sebelum menghapusnya.
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
            onClick={handleDelete}
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

export default EditDepartmentAdmin;