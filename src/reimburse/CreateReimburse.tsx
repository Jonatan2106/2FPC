import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
} from "@mui/material";

const CreateReimburse: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState<number | "">("");

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

  const handleSubmit = () => {
    if (!file || !amount || amount <= 0) return;

    console.log("Submit reimburse:", { file, amount });

    // TODO:
    // 1. Upload file → get URL
    // 2. POST to backend:
    //    { evidence: file_url, amount, user_id: currentUserId }
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
            New Reimbursement
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Upload your expense receipt and enter the requested amount
          </Typography>
        </Box>

        {/* Amount Input */}
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          fullWidth
          variant="outlined"
          inputProps={{ min: 0 }}
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
              cursor: "pointer",
            }}
          >
            <input
              type="file"
              hidden
              id="upload"
              onChange={handleFileChange}
            />
            <label htmlFor="upload">
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
              <Button size="small" color="error" onClick={handleRemoveFile}>
                Remove
              </Button>
            </Box>
          </Box>
        )}

        {/* Submit */}
        <Button
          variant="contained"
          size="large"
          disabled={!file || !amount || amount <= 0}
          onClick={handleSubmit}
        >
          Submit Reimbursement
        </Button>
      </Box>
    </Box>
  );
};

export default CreateReimburse;