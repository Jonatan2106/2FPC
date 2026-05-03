import React from "react";
import { Box, Typography, TextField, Button, Link, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login: React.FC = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const API_BASE_URL = "http://localhost:8080/api/web";

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.message === "Login success") {
        const userData = {
          user_id: data.data.user_id,
          name: data.data.username,
          email: `${data.data.username}@company.local`,
          password: "", // Don't store password
          alamat: "",
          nomor_telepon: "",
          foto: null,
          salary: 0,
          type: data.data.type,
        };

        localStorage.setItem("authToken", data.data.token);

        login(userData, data.data.token);
        navigate("/");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login");
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
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Username"
          type="text"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          disabled={loading}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <Button
          variant="contained"
          size="large"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Log in"}
        </Button>

        <Link href="/forgot-password" textAlign="center">
          Forgot your password?
        </Link>
      </Box>
    </Box>
  );
};

export default Login;