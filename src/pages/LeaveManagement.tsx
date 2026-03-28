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

type Leave = {
  leave_id: string;
  user_id: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  approvedAt?: Date;
};

const mockData: Leave[] = [
  {
    leave_id: "1",
    user_id: "u1",
    startDate: new Date("2026-03-25"),
    endDate: new Date("2026-03-27"),
    reason: "Family event",
    status: "PENDING",
    createdAt: new Date(),
  },
];

const LeaveManagement: React.FC = () => {
  const [data, setData] = React.useState<Leave[]>(mockData);
  const [selected, setSelected] = React.useState<Leave | null>(null);

  const handleApprove = (id: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.leave_id === id
          ? { ...item, status: "APPROVED", approvedAt: new Date() }
          : item
      )
    );
  };

  const handleReject = (id: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.leave_id === id
          ? { ...item, status: "REJECTED", approvedAt: new Date() }
          : item
      )
    );
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Leave Requests
      </Typography>

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
              <TableCell>Staff ID</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Approved At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((l) => (
              <TableRow
                key={l.leave_id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => setSelected(l)}
              >
                <TableCell>{l.user_id}</TableCell>

                <TableCell>
                  {l.startDate.toLocaleDateString()}
                </TableCell>

                <TableCell>
                  {l.endDate.toLocaleDateString()}
                </TableCell>

                <TableCell>
                  <Chip
                    label={l.status}
                    color={
                      l.status === "APPROVED"
                        ? "success"
                        : l.status === "REJECTED"
                        ? "error"
                        : "warning"
                    }
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  {l.createdAt.toLocaleDateString()}
                </TableCell>

                <TableCell>
                  {l.approvedAt
                    ? l.approvedAt.toLocaleDateString()
                    : "-"}
                </TableCell>

                <TableCell align="right">
                  {l.status === "PENDING" && (
                    <>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(l.leave_id);
                        }}
                      >
                        Approve
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(l.leave_id);
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(l);
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
                Leave Detail
              </Typography>

              <Chip
                label={selected.status}
                color={
                  selected.status === "APPROVED"
                    ? "success"
                    : selected.status === "REJECTED"
                    ? "error"
                    : "warning"
                }
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" mb={1}>
                Staff: {selected.user_id}
              </Typography>

              <Typography variant="body2" mb={1}>
                Start: {selected.startDate.toLocaleDateString()}
              </Typography>

              <Typography variant="body2" mb={1}>
                End: {selected.endDate.toLocaleDateString()}
              </Typography>

              <Typography variant="body2" mb={1}>
                Created: {selected.createdAt.toLocaleString()}
              </Typography>

              {selected.reason && (
                <Typography variant="body2" mb={1}>
                  Reason: {selected.reason}
                </Typography>
              )}

              {selected.status === "PENDING" && (
                <Box mt={3} display="flex" gap={1}>
                  <Button
                    variant="contained"
                    onClick={() =>
                      handleApprove(selected.leave_id)
                    }
                  >
                    Approve
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      handleReject(selected.leave_id)
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
  );
};

export default LeaveManagement;