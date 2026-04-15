import React from "react";
import { Box, Typography, TextField, Button, Link } from "@mui/material";

const Login: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleLogin = () => {
    console.log("Login", { email, password });
    // TODO call API
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

      <Box
        sx={{
          width: "100%",
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button variant="contained" size="large" onClick={handleLogin}>
          Log in
        </Button>

        <Link href="/forgot-password" textAlign="center">
          Forgot your password?
        </Link>
      </Box>
    </Box>
  );
};

export default Login;