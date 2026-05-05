import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  MenuItem,
} from "@mui/material";
import Navbar from "../../common/Navbar";

type StaffUser = {
  user_id: string;
  name: string;
};

const Penalty: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [selectedUser, setSelectedUser] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  const [amount, setAmount] = useState<number | "">("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const API_BASE_URL = "http://localhost:8080/api/web";

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

    if (selected.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }

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
        setPreview(null);

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
    { value: "late", label: "Late" },
    { value: "other", label: "Other" },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        bgcolor: "#ffffff",
        px: 2,
        py: 6,
      }}
    >
      <Navbar />

      <Box sx={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            New Penalty
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Create penalty for staff member
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Penalty created successfully</Alert>}

        {/* STAFF DROPDOWN */}
        <TextField
          select
          label="Select Staff"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          fullWidth
          disabled={fetching}
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
        />

        {/* FILE */}
        <Box>
          {!file && (
            <Box
              sx={{
                border: "1px dashed #d0d0d0",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                bgcolor: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              <input
                type="file"
                hidden
                id="upload"
                onChange={handleFileChange}
                disabled={loading}
              />

              <label htmlFor="upload" style={{ cursor: loading ? "not-allowed" : "pointer" }}>
                <Typography variant="body1" color="textSecondary">
                  Click to upload evidence (image or PDF)
                </Typography>
              </label>
            </Box>
          )}
        </Box>

        {/* NOTE */}
        <TextField
          label="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />

        {/* SUBMIT */}
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? <CircularProgress size={24} /> : "Submit Penalty"}
        </Button>
      </Box>
    </Box>
  );
};

export default Penalty;