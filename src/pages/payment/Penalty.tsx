import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";

const Penalty: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState<number | "">("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const API_BASE_URL = "http://localhost:8080/api/web";

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);

    if (selected.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async () => {
    if (!file || !amount || Number(amount) <= 0) {
      setError("Please select a file and enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Convert file to base64 for now (in production, use proper file upload)
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;

        try {
          const response = await fetch(`${API_BASE_URL}/penalties`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
              amount: Number(amount),
              evidence: base64,
            }),
          });

          const data = await response.json();

          if (response.ok && data.message && data.message.includes("success")) {
            setSuccess(true);
            setFile(null);
            setPreview(null);
            setAmount("");
            setTimeout(() => setSuccess(false), 2000);
          } else {
            setError(data.message || "Failed to submit penalty request");
          }
        } catch (err) {
          setError("An error occurred while submitting penalty request");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("An error occurred while processing file");
      setLoading(false);
      console.error(err);
    }
  };

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
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* Title */}
        <Box>
          <Typography variant="h5" fontWeight={600} color="textPrimary">
            New Penalty
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Input penalty for damaged goods and upload evidence
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Penalty request submitted successfully!</Alert>}

        {/* Amount Input */}
        <TextField
          label="Penalty Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          fullWidth
          variant="outlined"
          inputProps={{ min: 0 }}
          disabled={loading}
        />

        {/* Upload Box */}
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

        {/* Preview / File Info */}
        {file && (
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              p: 2,
              bgcolor: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="preview"
                style={{ width: "100%", borderRadius: 8 }}
              />
            ) : (
              <Typography variant="body2">{file.name}</Typography>
            )}

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="textSecondary">
                {file.name}
              </Typography>
              <Button
                size="small"
                color="error"
                onClick={handleRemoveFile}
                disabled={loading}
              >
                Remove
              </Button>
            </Box>
          </Box>
        )}

        {/* Submit */}
        <Button
          variant="contained"
          size="large"
          disabled={!file || !amount || Number(amount) <= 0 || loading}
          onClick={handleSubmit}
        >
          {loading ? <CircularProgress size={24} /> : "Submit Penalty"}
        </Button>
      </Box>
    </Box>
  );
};

export default Penalty;