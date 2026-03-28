import React from "react";
import { Box, Typography, TextField, Button, Link } from "@mui/material";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = React.useState("");

  const handleSubmit = () => {
    console.log("Forgot password request for:", email);
    // TODO: call API to send reset link
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

        <Link href="/login" textAlign="center">
          Back to login
        </Link>
      </Box>
    </Box>
  );
};

export default ForgotPassword;