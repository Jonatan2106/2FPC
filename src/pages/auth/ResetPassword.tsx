import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

const ResetPassword: React.FC = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || ""; // Menangkap email dari URL

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [status, setStatus] = React.useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const getHeaders = () => ({
    "Content-Type": "application/json",
  });
  
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ type: 'error', msg: "Passwords do not match!" });
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/users/${encodeURIComponent(email)}/reset-password`, {
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
      console.error(error);
      setStatus({ type: 'error', msg: "Network error, please try again later." });
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
        bgcolor: "#f8fafc",
        px: 2,
        boxSizing: "border-box",
      }}
    >
      {/* Logo / branding */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700} color="#0f172a">
          2FPC
        </Typography>
      </Box>

      {/* Main Container Card */}
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          p: { xs: 2, sm: 3 },
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            p: 0,
            "&:last-child": { pb: 0 },
          }}
        >
          <Box sx={{ textAlign: "center", mb: 1 }}>
            <Typography variant="h5" fontWeight={700} color="#0f172a" gutterBottom>
              Reset Password 🔒
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resetting password for: <Box component="span" fontWeight={600} color="#0f172a">{email || "Unknown"}</Box>
            </Typography>
          </Box>

          {status && (
            <Alert severity={status.type} sx={{ borderRadius: 2 }}>
              {status.msg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleReset} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />

            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={!email}
              sx={{
                py: 1.4,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
                bgcolor: "#2563eb",
                boxShadow: "none",
                "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
              }}
            >
              Reset Password
            </Button>
          </Box>

          <Box sx={{ textAlign: "center", mt: 1 }}>
            <MuiLink
              component={Link}
              to="/login"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                fontWeight: 600,
                color: "#64748b",
                textDecoration: "none",
                fontSize: "0.9rem",
                "&:hover": { color: "#0f172a" },
              }}
            >
              <ArrowBack sx={{ fontSize: 16 }} /> Back to login
            </MuiLink>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPassword;