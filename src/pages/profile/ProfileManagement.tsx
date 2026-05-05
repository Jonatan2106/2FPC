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
} from "@mui/material";
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

  const API_BASE_URL = "http://localhost:8080/api/web";

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
    <Container maxWidth="sm">
      <Navbar/>
      <Paper elevation={3} sx={{ padding: 4, mt: 5 }}>
        {/* Avatar */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar
            src={user.foto || undefined}
            sx={{ width: 100, height: 100 }}
          />
          {editing && (
            <Button variant="text" component="label" sx={{ mt: 1 }} disabled={loading}>
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
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully!</Alert>}

        {/* Form fields */}
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Name"
            fullWidth
            value={user.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={!editing || loading}
            required
          />
          <TextField
            label="Email"
            fullWidth
            value={user.email}
            disabled
          />
          <TextField
            label="Address"
            fullWidth
            value={user.alamat}
            onChange={(e) => handleChange("alamat", e.target.value)}
            disabled={!editing || loading}
            required
          />
          <TextField
            label="Phone Number"
            fullWidth
            value={user.nomor_telepon}
            onChange={(e) => handleChange("nomor_telepon", e.target.value)}
            disabled={!editing || loading}
            required
          />

          {/* Staff-specific info */}
          {isStaff && (
            <Box display="flex" gap={2}>
              <TextField
                label="Role"
                fullWidth
                value={userData.role}
                disabled
              />
            </Box>
          )}

          {/* Save/Edit button */}
          <Box display="flex" justifyContent="center" mt={2}>
            {editing ? (
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Save"}
              </Button>
            ) : (
              <Button variant="outlined" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfileManagement;