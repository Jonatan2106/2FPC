import React from "react";
import { Box, Typography, TextField, Button, Link, Alert, AlertTitle } from "@mui/material";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [showSimulatedEmail, setShowSimulatedEmail] = React.useState(false);

  const handleSubmit = () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }
    // Simulasi pengiriman email reset
    setShowSimulatedEmail(true);
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "#ffffff", px: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="textPrimary">2FPC</Typography>
      </Box>

      <Box sx={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 2 }}>
        {showSimulatedEmail && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Klik link di bawah untuk mereset password:</AlertTitle>
            <Link href={`/reset-password?email=${encodeURIComponent(email)}`} sx={{ fontWeight: 'bold' }}>
              Reset Password untuk {email}
            </Link>
          </Alert>
        )}

        <Typography textAlign="center" variant="body1" mb={1}>
          Enter your email to receive a password reset link
        </Typography>

        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />

        <Button variant="contained" size="large" onClick={handleSubmit}>
          Send Reset Link
        </Button>

        <Link href="/login" textAlign="center">Back to login</Link>
      </Box>
    </Box>
  );
};

export default ForgotPassword;