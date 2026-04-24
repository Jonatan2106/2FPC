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
import { userApi } from "../../services/api";

const CreateUser: React.FC = () => {
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState<"Staff" | "Manager">("Staff");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const handleCreateUser = async () => {
    if (!name) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await userApi.createStaffAccount(name, role);

      if (response.message === "Staff account created") {
        setSuccess(true);
        setName("");
        setRole("Staff");
        // Reset success message after 2 seconds
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(response.message || "Failed to create user");
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