import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  TextField,
  Container,
  Paper,
  Box,
  CircularProgress,
  Alert,
  MenuItem,
} from "@mui/material";
import { useParams } from "react-router-dom";
import Navbar from "../../common/Navbar";
import type { User } from "../../types/user";

const AdminEditUserPage: React.FC = () => {
  const { id } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<any>(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const API_BASE_URL = "http://localhost:8080/api/web";

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
          headers: getHeaders(),
        });

        const data = await res.json();

        if (!res.ok) {
          setError("Failed to fetch user");
          return;
        }

        setUser(data.data);
        setStaff(data.data.staff_detail || null);
      } catch (err) {
        setError("Error fetching user");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleUserChange = (field: keyof User, value: any) => {
    if (!user) return;
    setUser({ ...user, [field]: value });
  };

  const handleStaffChange = (field: string, value: any) => {
    if (!staff) return;
    setStaff({ ...staff, [field]: value });
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError("");

    try {
      const userRes = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          alamat: user.alamat,
          nomor_telepon: user.nomor_telepon,
          salary: user.salary,
          type: user.type,
          foto: user.foto,
        }),
      });

      const userData = await userRes.json();

      if (!userRes.ok) {
        setError(userData.message || "Failed to update user");
        return;
      }

      if (staff) {
        const staffRes = await fetch(
          `${API_BASE_URL}/admin/staff-details/${id}`,
          {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({
              role: staff.role,
              departement_id: staff.departement_id,
            }),
          }
        );

        const staffData = await staffRes.json();

        if (!staffRes.ok) {
          setError(staffData.message || "Failed to update staff");
          return;
        }
      }

      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError("Error updating user");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;

    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () =>
        setUser({ ...user, foto: reader.result as string });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return null;

  return (
    <Container maxWidth="sm">
      <Navbar />
      <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
        {/* Avatar */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar src={user.foto || undefined} sx={{ width: 100, height: 100 }} />
          {editing && (
            <Button component="label" sx={{ mt: 1 }}>
              Upload Avatar
              <input hidden type="file" onChange={handleAvatarChange} />
            </Button>
          )}
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">User updated successfully</Alert>}

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField fullWidth
            label="Name"
            value={user.name}
            onChange={(e) => handleUserChange("name", e.target.value)}
            disabled={!editing}
          />

          <TextField fullWidth
            label="Email"
            value={user.email}
            onChange={(e) => handleUserChange("email", e.target.value)}
            disabled={!editing}
          />

          <TextField fullWidth
            label="Address"
            value={user.alamat || ""}
            onChange={(e) => handleUserChange("alamat", e.target.value)}
            disabled={!editing}
          />

          <TextField fullWidth
            label="Phone"
            value={user.nomor_telepon || ""}
            onChange={(e) => handleUserChange("nomor_telepon", e.target.value)}
            disabled={!editing}
          />

          <TextField fullWidth
            label="Salary"
            type="number"
            value={user.salary || ""}
            onChange={(e) => handleUserChange("salary", Number(e.target.value))}
            disabled={!editing}
          />

          <TextField fullWidth
            select
            label="Type"
            value={user.type}
            onChange={(e) => handleUserChange("type", e.target.value)}
            disabled={!editing}
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Staff">Staff</MenuItem>
          </TextField>

          {/* Staff Section */}
          {staff && (
            <>
              <TextField fullWidth
                select
                label="Role"
                value={staff.role}
                onChange={(e) => handleStaffChange("role", e.target.value)}
                disabled={!editing}
              >
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Staff">Staff</MenuItem>
              </TextField>

              <TextField fullWidth
                label="Department ID"
                value={staff.departement_id || ""}
                onChange={(e) =>
                  handleStaffChange("departement_id", e.target.value)
                }
                disabled={!editing}
              />
            </>
          )}

          <Box display="flex" justifyContent="center" mt={2}>
            {editing ? (
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                {saving ? <CircularProgress size={24} /> : "Save"}
              </Button>
            ) : (
              <Button variant="outlined" onClick={() => setEditing(true)}>
                Edit User
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminEditUserPage;