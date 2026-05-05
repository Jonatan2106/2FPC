import React from "react";
import { Box, Typography, TextField, Button, Link, Alert } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || ""; // Menangkap email dari URL

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [status, setStatus] = React.useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const getHeaders = () => ({
    "Content-Type": "application/json",
  });
  
  const handleReset = async () => {
    if (password !== confirmPassword) {
      setStatus({ type: 'error', msg: "Passwords do not match!" });
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/web/auth/users/${encodeURIComponent(email)}/reset-password`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ 
          newPassword: password 
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', msg: "Password reset successfully! Redirecting to login..." });
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setStatus({ type: 'error', msg: result.message || "Failed to reset password" });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: "Network error, please try again later." });
    }
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "#ffffff", px: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="textPrimary">2FPC</Typography>
      </Box>

      <Box sx={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography textAlign="center" variant="h6">Reset Password</Typography>
        <Typography textAlign="center" variant="body2" color="textSecondary">
          Resetting password for: <b>{email}</b>
        </Typography>

        {status && <Alert severity={status.type}>{status.msg}</Alert>}

        <TextField
          label="New Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button variant="contained" size="large" onClick={handleReset} disabled={!email}>
          Reset Password
        </Button>

        <Link href="/login" textAlign="center">Back to login</Link>
      </Box>
    </Box>
  );
};

export default ResetPassword;