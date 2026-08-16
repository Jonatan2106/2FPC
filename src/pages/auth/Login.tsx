import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login: React.FC = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const envUrl = (import.meta.env.VITE_API_BASE_URL || "https://twofpc.onrender.com").trim();
  const cleanBaseUrl = envUrl.startsWith("http") ? envUrl : `https://${envUrl.replace(/^\/+/, "")}`;
  const API_BASE_URL = `${cleanBaseUrl.replace(/\/$/, "")}/api/web`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.message === "Login success") {
        // Objek user dikembalikan ke bentuk semula yang sederhana
        const userData = {
          user_id: data.data.user_id,
          name: data.data.name,
          email: data.data.email,
          password: "", 
          alamat: data.data.alamat || "",
          nomor_telepon: data.data.nomor_telepon || "",
          foto: data.data.foto || null,
          salary: data.data.salary || 0,
          type: data.data.type,
        };

        localStorage.setItem("authToken", data.data.token);
        login(userData, data.data.token);

        navigate("/");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during login");
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
        bgcolor: "#f8fafc",
        px: 2,
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700} color="#0f172a">
          2FPC
        </Typography>
      </Box>

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
              Welcome Back! 👋
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please sign in to your account to continue.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Username"
              type="text"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              disabled={loading}
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
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
              {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Log in"}
            </Button>
          </Box>

          <Box sx={{ textAlign: "center", mt: 1 }}>
            <MuiLink
              component={Link}
              to="/forgot-password"
              sx={{
                fontWeight: 600,
                color: "#64748b",
                textDecoration: "none",
                fontSize: "0.9rem",
                "&:hover": { color: "#2563eb" },
              }}
            >
              Forgot your password?
            </MuiLink>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;