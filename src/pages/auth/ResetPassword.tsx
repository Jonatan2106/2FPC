import React from "react";
import { Box, Typography, TextField, Button, Link } from "@mui/material";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const handleReset = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Reset password:", password);
    // TODO: call API to reset password
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
      {/* Logo / branding */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="textPrimary">
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
        <Typography textAlign="center" variant="body1" mb={1}>
          Enter your new password
        </Typography>

        <TextField
          label="New Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />

        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button variant="contained" size="large" onClick={handleReset}>
          Reset Password
        </Button>

        <Link href="/login" textAlign="center">
          Back to login
        </Link>
      </Box>
    </Box>
  );
};

export default ResetPassword;