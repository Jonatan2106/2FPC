import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Navbar from "../../common/Navbar";
import { useNavigate } from "react-router-dom";

interface Department {
  departement_id: string;
  company_name: string;
}

const CreateUser: React.FC = () => {
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState<"Staff" | "Manager">("Staff");
  const [selectedDepartment, setSelectedDepartment] = React.useState("");
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [departmentsLoading, setDepartmentsLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const API_BASE_URL = `${BASE_URL}/api/web`;

  // Get auth token from localStorage
  const getToken = () => localStorage.getItem("authToken");
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`,
  });

  // Fetch departments on component mount
  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // PERBAIKAN: Ubah dari /departments menjadi /departements
        const response = await fetch(`${API_BASE_URL}/departements`, {
          headers: getHeaders(),
        });
        const data = await response.json();
        if (response.ok) {
          setDepartments(data.data || []);
        } else {
          console.error("Failed to fetch departments:", data.message);
        }
      } catch (err) {
        console.error("Error fetching departments:", err);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleCreateUser = async () => {
    if (!name) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/staff-account`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          username: name,
          role,
          departement_id: selectedDepartment || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.message === "Staff account created") {
        setSuccess(true);
        setName("");
        setRole("Staff");
        setSelectedDepartment("");
        
        // --- UBAH DI SINI ---
        // Tampilkan pesan sukses sebentar, lalu arahkan otomatis ke management-tree
        setTimeout(() => {
          navigate("/management-tree");
        }, 1000);
        
      } else {
        setError(data.message || "Failed to create user");
      }
    } catch (err) {
      setError("An error occurred while creating the user");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8fafc",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, md: 5 },
        boxSizing: "border-box",
      }}
    >
      <Navbar />

      <Box
        sx={{
          width: "100%",
          maxWidth: 480,
          mx: "auto",
          mt: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            backgroundColor: "#ffffff",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
          }}
        >
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={700} color="#0f172a" gutterBottom>
                Create New User 👤
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Add a new staff or manager account to the system
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                User created successfully!
              </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="Full Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <TextField
                select
                label="Role"
                fullWidth
                value={role}
                onChange={(e) => setRole(e.target.value as "Staff" | "Manager")}
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2 } }}
              >
                <MenuItem value="Staff">Staff</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
              </TextField>

              <TextField
                select
                label="Department"
                fullWidth
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                disabled={loading || departmentsLoading}
                InputProps={{ sx: { borderRadius: 2 } }}
              >
                <MenuItem value="">
                  <em>No Department</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.departement_id} value={dept.departement_id}>
                    {dept.company_name}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="contained"
                size="large"
                onClick={handleCreateUser}
                disabled={loading}
                startIcon={!loading ? <PersonAddIcon /> : undefined}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                  bgcolor: "#2563eb",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Create User"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default CreateUser;