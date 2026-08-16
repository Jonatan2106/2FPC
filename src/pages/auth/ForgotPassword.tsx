import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  Alert,
  AlertTitle,
  Card,
  CardContent,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Email, ArrowBack } from "@mui/icons-material";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [showSimulatedEmail, setShowSimulatedEmail] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }
    // Simulasi pengiriman email reset
    setShowSimulatedEmail(true);
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
      }}
    >
      {/* Brand / Logo Title */}
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
              Forgot Password? 🔑
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your registered email address to receive a password reset link.
            </Typography>
          </Box>

          {showSimulatedEmail && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <AlertTitle fontWeight={600}>Simulasi Pengiriman Email</AlertTitle>
              Klik link di bawah ini untuk mereset password Anda:
              <Box sx={{ mt: 1 }}>
                <MuiLink
                  component={Link}
                  to={`/reset-password?email=${encodeURIComponent(email)}`}
                  sx={{ fontWeight: "bold", color: "#2563eb", textDecoration: "none" }}
                >
                  Reset Password untuk {email}
                </MuiLink>
              </Box>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
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
              Send Reset Link
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

export default ForgotPassword;