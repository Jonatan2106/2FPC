import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Link,
} from "@mui/material";

const CreateUser: React.FC = () => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [salary, setSalary] = React.useState("");
  const [role, setRole] = React.useState("staff");

  const handleCreateUser = () => {
    if (!name || !email || !salary || !role) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      name,
      email,
      salary: Number(salary),
      role,
    };

    console.log("Create User:", payload);
    // TODO: call API
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

        <TextField
          label="Full Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Salary"
          type="number"
          fullWidth
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />

        <TextField
          select
          label="Role"
          fullWidth
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <MenuItem value="staff">Staff</MenuItem>
          <MenuItem value="manager">Manager</MenuItem>
        </TextField>

        <Button variant="contained" size="large" onClick={handleCreateUser}>
          Create User
        </Button>

        <Link href="/dashboard" textAlign="center">
          Back to Dashboard
        </Link>
      </Box>
    </Box>
  );
};

export default CreateUser;