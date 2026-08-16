import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  MenuItem,
  Card,
  CardContent,
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Navbar from "../../common/Navbar";

type StaffUser = {
  user_id: string;
  name: string;
};

const Penalty: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [selectedUser, setSelectedUser] = useState("");

  const [file, setFile] = useState<File | null>(null);

  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  const [amount, setAmount] = useState<number | "">("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const API_BASE_URL = `${BASE_URL}/api/web`;

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  // 🔥 FETCH STAFF LIST
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/users`, {
          headers: getHeaders(),
        });

        const data = await res.json();

        if (!res.ok) {
          setError("Failed to fetch staff list");
          return;
        }

        const staffOnly = (data.data || [])
          .filter((u: any) => u.type === "Staff")
          .map((u: any) => ({
            user_id: u.user_id,
            name: u.name,
          }));

        setStaffList(staffOnly);
      } catch (err) {
        setError("Error loading staff");
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchStaff();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);

    // store filename in note (since backend has no evidence field)
    setNote(selected.name);
  };

  const handleSubmit = async () => {
    if (!selectedUser || !category || !amount) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/penalties`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          user_id: selectedUser,
          category,
          note,
          amount: Number(amount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);

        setSelectedUser("");
        setCategory("");
        setNote("");
        setAmount("");
        setFile(null);

        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(data.message || "Failed to create penalty");
      }
    } catch (err) {
      setError("Server error while creating penalty");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const penaltyCategories = [
    { value: "unpaid_cuti", label: "Unpaid Leave" },
    { value: "broken_stuff", label: "Broken Item" },
    { value: "other", label: "Other" },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8fafc",
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 3, md: 5 },
        boxSizing: 'border-box',
      }}
    >
      <Navbar />

      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 620, md: 760, lg: 820 },
          mx: "auto",
          mt: 3,
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, md: 3 },
        }}
      >
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            backgroundColor: '#ffffff',
            borderRadius: 3,
            border: '1px solid #e2e8f0',
          }}
        >
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight={700} color="#0f172a" gutterBottom>
                New Penalty ⚠️
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create penalty record for a staff member.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                Penalty created successfully
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* STAFF DROPDOWN */}
              <TextField
                select
                label="Select Staff"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                fullWidth
                disabled={fetching}
                InputProps={{ sx: { borderRadius: 2 } }}
              >
                {staffList.map((staff) => (
                  <MenuItem key={staff.user_id} value={staff.user_id}>
                    {staff.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* CATEGORY */}
              <TextField
                select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                fullWidth
                InputProps={{ sx: { borderRadius: 2 } }}
              >
                {penaltyCategories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </TextField>

              {/* AMOUNT */}
              <TextField
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                fullWidth
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              {/* FILE */}
              <Box>
                <Box
                  component="label"
                  htmlFor="upload"
                  sx={{
                    border: "2px dashed #cbd5e1",
                    borderRadius: 2.5,
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    bgcolor: "#f8fafc",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#2563eb",
                      bgcolor: "#eff6ff",
                    }
                  }}
                >
                  <input
                    type="file"
                    hidden
                    id="upload"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                  <CloudUploadIcon sx={{ fontSize: 40, color: "#64748b", mb: 1 }} />
                  <Typography variant="body1" fontWeight={600} color="#0f172a">
                    {file ? file.name : "Click to upload evidence"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    Supports image or PDF files
                  </Typography>
                </Box>
              </Box>

              {/* NOTE */}
              <TextField
                label="Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                fullWidth
                multiline
                rows={3}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              {/* SUBMIT */}
              <Button
                variant="contained"
                disabled={loading}
                onClick={handleSubmit}
                size="large"
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                  bgcolor: "#2563eb",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Submit Penalty"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Penalty;