import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";

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

  const API_BASE_URL = "http://localhost:8080/api/web";

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
        const response = await fetch(`${API_BASE_URL}/departments`, {
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
        // Reset success message after 2 seconds
        setTimeout(() => setSuccess(false), 2000);
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
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#ffffff",
        px: 2,
        boxSizing: "border-box",
      }}
    >
      {/* Branding */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          2FPC
        </Typography>
      </Box>

      {/* Form */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography textAlign="center" variant="h6" mb={1}>
          Create New User
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">User created successfully!</Alert>}

        <TextField
          label="Full Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          disabled={loading}
        />

        <TextField
          select
          label="Role"
          fullWidth
          value={role}
          onChange={(e) => setRole(e.target.value as "Staff" | "Manager")}
          disabled={loading}
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
        >
          {loading ? <CircularProgress size={24} /> : "Create User"}
        </Button>

        <Link href="/dashboard" textAlign="center">
          Back to Dashboard
        </Link>
      </Box>
    </Box>
  );
};

export default CreateUser;