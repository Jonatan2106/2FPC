import React from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";

import type { User } from "../../types/user";
import Navbar from "../../common/Navbar";

const AdminUsersPage: React.FC = () => {
  const [data, setData] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const API_BASE_URL = "http://localhost:8080/api/web";

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/admin/users`, {
          method: "GET",
          headers: getHeaders(),
        });

        if (!response.ok) {
          setError("Failed to fetch users");
          return;
        }

        const result = await response.json();
        setData(result.data || []);
        setError("");
      } catch (err) {
        setError("An error occurred while fetching users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#ffffff",
        display: "flex",
        justifyContent: "center",
        px: 2,
        py: 4,
      }}
    >
      <Navbar />

      <Box sx={{ width: "100%", maxWidth: 1100 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          User Management
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              overflow: "hidden",
              backgroundColor: "#fff",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#fafafa" }}>
                    <TableCell><b>Name</b></TableCell>
                    <TableCell><b>Email</b></TableCell>
                    <TableCell><b>Type</b></TableCell>
                    <TableCell><b>Role</b></TableCell>
                    <TableCell><b>Department</b></TableCell>
                    <TableCell><b>Salary</b></TableCell>
                    <TableCell align="right"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {data.map((user: any) => {
                    const staff = user.staff_detail;

                    return (
                    <TableRow key={user.user_id} hover>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>

                        <TableCell>
                        <Chip
                            label={user.type}
                            color={user.type === "Admin" ? "primary" : "default"}
                            size="small"
                        />
                        </TableCell>

                        <TableCell>
                        {staff?.role ? (
                            <Chip
                            label={staff.role}
                            color={staff.role === "Manager" ? "success" : "default"}
                            size="small"
                            />
                        ) : (
                            "-"
                        )}
                        </TableCell>

                        <TableCell>
                        {staff?.departement_data?.name || "-"}
                        </TableCell>

                        <TableCell>{user.salary ?? "-"}</TableCell>

                        <TableCell align="right">
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() =>
                            window.location.href = `/users/${user.user_id}`
                            }
                        >
                            Edit
                        </Button>
                        </TableCell>
                    </TableRow>
                    );
                })}
                </TableBody>
            </Table>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminUsersPage;