import React, { useState } from "react";
import {
  Avatar,
  Button,
  TextField,
  Container,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import type { User } from "../../types/user";
import type { Staff } from "../../types/staff";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../common/Navbar";

interface ProfilePageProps {
  userData: User | Staff;
}

const ProfileManagement: React.FC<ProfilePageProps> = ({ userData }) => {
  const { user: authUser, login } = useAuth();
  const isStaff = "role" in userData;
  const initialUser: User = isStaff ? userData.user : userData;
  const [user, setUser] = useState<User>({ ...initialUser });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const API_BASE_URL = `${BASE_URL}/api/web`;

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
  });

  const handleChange = (field: keyof User, value: string) => {
    setUser({ ...user, [field]: value });
  };

  const handleSave = async () => {
    if (!user.name || !user.alamat || !user.nomor_telepon) {
      setError("Name, Address, and Phone are required.");
      return;
    }

    const userId = authUser?.user_id || user.user_id;
    if (!userId) {
      setError("User ID not found");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/staff/users/${userId}/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          name: user.name,
          alamat: user.alamat,
          nomor_telepon: user.nomor_telepon,
          foto: user.foto || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setEditing(false);

        const updatedUser = {
          ...authUser,
          ...user,
          name: data.data?.name ?? user.name,
          alamat: data.data?.alamat ?? user.alamat,
          nomor_telepon: data.data?.nomor_telepon ?? user.nomor_telepon,
          foto: data.data?.foto ?? user.foto,
        } as User;

        login(updatedUser, localStorage.getItem("authToken") || "");
        setUser(updatedUser);

        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      setError("An error occurred while updating profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => setUser({ ...user, foto: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      
      {/* Box ini akan memberikan padding khusus untuk area konten saja, tidak mengganggu Navbar */}
      <Box 
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexGrow: 1,
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 3, md: 5 },
          boxSizing: 'border-box',
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              backgroundColor: "#ffffff",
              borderRadius: 3,
              border: "1px solid #e2e8f0",
            }}
          >
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="#0f172a" gutterBottom>
                My Profile 📋
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View and update your personal account details
              </Typography>
            </Box>

            {/* Avatar */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
              <Avatar
                src={user.foto || undefined}
                sx={{ width: 96, height: 96, border: '3px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
              />
              {editing && (
                <Button
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={loading}
                  sx={{
                    mt: 2,
                    color: "#2563eb",
                    fontWeight: 600,
                    textTransform: "none",
                    bgcolor: "#eff6ff",
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    "&:hover": { bgcolor: "#dbeafe" }
                  }}
                >
                  Upload Avatar
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </Button>
              )}
            </Box>

            {/* Messages */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                Profile updated successfully!
              </Alert>
            )}

            {/* Form fields */}
            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                label="Name"
                fullWidth
                value={user.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={!editing || loading}
                required
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                label="Email"
                fullWidth
                value={user.email}
                disabled
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                label="Address"
                fullWidth
                value={user.alamat}
                onChange={(e) => handleChange("alamat", e.target.value)}
                disabled={!editing || loading}
                required
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                label="Phone Number"
                fullWidth
                value={user.nomor_telepon}
                onChange={(e) => handleChange("nomor_telepon", e.target.value)}
                disabled={!editing || loading}
                required
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              {/* Staff-specific info */}
              {isStaff && (
                <TextField
                  label="Role"
                  fullWidth
                  value={userData.role}
                  disabled
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              )}

              {/* Save/Edit button */}
              <Box display="flex" justifyContent="center" mt={1}>
                {editing ? (
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={loading}
                    startIcon={!loading ? <SaveIcon /> : undefined}
                    size="large"
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: "none",
                      bgcolor: "#2563eb",
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Save Changes"}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => setEditing(true)}
                    startIcon={<EditIcon />}
                    size="large"
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: "none",
                      borderColor: "#cbd5e1",
                      color: "#0f172a",
                      "&:hover": { borderColor: "#2563eb", bgcolor: "#eff6ff" },
                    }}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default ProfileManagement;