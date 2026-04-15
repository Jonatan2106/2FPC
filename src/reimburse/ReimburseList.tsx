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
  Drawer,
} from "@mui/material";

import type { Reimburse } from "../types/reimburse";

const mockData: Reimburse[] = [
  {
    reimburse_id: "1",
    amount: 120,
    approve: "PENDING",
    evidence: "https://via.placeholder.com/300",
    user_id: "u1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const ReimburseList: React.FC = () => {
  const [data, setData] = React.useState<Reimburse[]>(mockData);
  const [selected, setSelected] = React.useState<Reimburse | null>(null);

  const handleApprove = (id: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.reimburse_id === id
          ? { ...item, approve: "APPROVED", approvedAt: new Date() }
          : item
      )
    );
  };

  const handleReject = (id: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.reimburse_id === id
          ? { ...item, approve: "REJECTED", approvedAt: new Date() }
          : item
      )
    );
  };

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
      <Box sx={{ width: "100%", maxWidth: 1000 }}>
        {/* Title */}
        <Typography variant="h5" fontWeight={600} mb={3}>
          Reimburse Requests
        </Typography>

        {/* Table Container */}
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
                <TableCell><b>Staff ID</b></TableCell>
                <TableCell><b>Amount</b></TableCell>
                <TableCell><b>Evidence</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Created At</b></TableCell>
                <TableCell><b>Approved At</b></TableCell>
                <TableCell align="right"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((r) => (
                <TableRow
                  key={r.reimburse_id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => setSelected(r)}
                >
                  <TableCell>{r.user_id}</TableCell>

                  <TableCell>${r.amount.toFixed(2)}</TableCell>

                  <TableCell>
                    {r.evidence ? (
                      <img
                        src={r.evidence}
                        alt="evidence"
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={r.approve}
                      color={
                        r.approve === "APPROVED"
                          ? "success"
                          : r.approve === "REJECTED"
                          ? "error"
                          : "warning"
                      }
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    {r.approvedAt
                      ? new Date(r.approvedAt).toLocaleDateString()
                      : "-"}
                  </TableCell>

                  <TableCell align="right">
                    {r.approve === "PENDING" && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ mr: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(r.reimburse_id);
                          }}
                        >
                          Approve
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(r.reimburse_id);
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    <Button
                      size="small"
                      sx={{ ml: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(r);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* DRAWER */}
        <Drawer
          anchor="right"
          open={!!selected}
          onClose={() => setSelected(null)}
        >
          <Box sx={{ width: 400, p: 3 }}>
            {selected && (
              <>
                <Typography variant="h6" mb={2}>
                  Reimburse Detail
                </Typography>

                <Chip
                  label={selected.approve}
                  color={
                    selected.approve === "APPROVED"
                      ? "success"
                      : selected.approve === "REJECTED"
                      ? "error"
                      : "warning"
                  }
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2" mb={1}>
                  Staff: {selected.user_id}
                </Typography>

                <Typography variant="body2" mb={1}>
                  Amount: ${selected.amount.toFixed(2)}
                </Typography>

                <Typography variant="body2" mb={1}>
                  Created:{" "}
                  {new Date(selected.createdAt).toLocaleString()}
                </Typography>

                {selected.evidence && (
                  <img
                    src={selected.evidence}
                    alt="evidence"
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      marginTop: 10,
                    }}
                  />
                )}

                {selected.approve === "PENDING" && (
                  <Box mt={3} display="flex" gap={1}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() =>
                        handleApprove(selected.reimburse_id)
                      }
                    >
                      Approve
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      onClick={() =>
                        handleReject(selected.reimburse_id)
                      }
                    >
                      Reject
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
};

export default ReimburseList;