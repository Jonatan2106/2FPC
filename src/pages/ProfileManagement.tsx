import React, { useState } from "react";
import {
  Avatar,
  Button,
  TextField,
  Container,
  Paper,
  Box,
} from "@mui/material";
import type { User } from "../types/user";
import type { Staff } from "../types/staff";

interface ProfilePageProps {
  userData: User | Staff;
}


const ProfileManagement: React.FC<ProfilePageProps> = ({ userData }) => {
  const isStaff = "role" in userData;
const initialUser: User = isStaff ? userData.user : userData;
  const [user, setUser] = useState<User>({ ...initialUser });
  const [editing, setEditing] = useState(false);

  const handleChange = (field: keyof User, value: string) => {
    setUser({ ...user, [field]: value });
  };

  const handleSave = () => {
    if (!user.name || !user.alamat || !user.nomor_telepon) {
      alert("Name, Address, and Phone are required.");
      return;
    }
    console.log("Profile saved:", user);
    setEditing(false);
    // TODO: call API to save profile
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
      <Paper elevation={3} sx={{ padding: 4, mt: 5 }}>
        {/* Avatar */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar
            src={user.foto || undefined}
            sx={{ width: 100, height: 100 }}
          />
          {editing && (
            <Button variant="text" component="label" sx={{ mt: 1 }}>
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

        {/* Form fields */}
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Name"
            fullWidth
            value={user.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={!editing}
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
            disabled={!editing}
            required
          />
          <TextField
            label="Phone Number"
            fullWidth
            value={user.nomor_telepon}
            onChange={(e) => handleChange("nomor_telepon", e.target.value)}
            disabled={!editing}
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
              <Button variant="contained" onClick={handleSave}>
                Save
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