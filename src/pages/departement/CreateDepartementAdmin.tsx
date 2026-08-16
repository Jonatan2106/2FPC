import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import BusinessIcon from '@mui/icons-material/Business';
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
import Navbar from "../../common/Navbar";

const CreateDepartementAdmin: React.FC = () => {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const API_BASE_URL = `${BASE_URL}/api/web`;

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Menggunakan rute backend /departements (dengan 'e')
      const response = await fetch(`${API_BASE_URL}/admin/departements`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to create department");
        return;
      }

      setSuccess("Department created successfully! Redirecting...");
      setTimeout(() => {
        navigate("/management-tree");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("An error occurred while creating department");
    } finally {
      setLoading(false);
    }
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
            onSubmit={handleSubmit}
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
                Create Department 🏢
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Add a new organization department or company node
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
                required
                type="password"
                label="Password"
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

              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={!loading ? <SaveIcon /> : undefined}
                  size="large"
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: "none",
                    bgcolor: "#2563eb",
                    boxShadow: "none",
                    width: "100%",
                    "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Create Department"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default CreateDepartementAdmin;