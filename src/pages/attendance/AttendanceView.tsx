import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  Chip,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  ArrowBack,
  AccessTime,
  CalendarMonth,
} from "@mui/icons-material";
import Navbar from "../../common/Navbar";

type AttendanceRecord = {
  attendance_id: string;
  user_id: string;
  clock_in: string;
  clock_out: string | null;
  user?: {
    id?: string;
    name?: string | null;
    departement?: string | null;
    role?: string | null;
  };
};

const toDateKey = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const sameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const formatTimeOnly = (value: string | null): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ViewAttendance: React.FC = () => {
  const [data, setData] = React.useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date());

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const API_BASE_URL = `${BASE_URL}/api/web`;

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
  });

  React.useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/attendance`, {
          headers: getHeaders(),
        });

        const responseData = await response.json();

        if (response.ok && responseData.data && Array.isArray(responseData.data)) {
          const mapped = responseData.data.map((item: unknown) => {
            const obj = item as Record<string, unknown>;
            const userObj = obj.user as Record<string, unknown> | undefined;
            return {
              attendance_id: String(obj.attendance_id ?? obj.id ?? ""),
              user_id: String(obj.user_id ?? ""),
              clock_in: String(obj.clock_in ?? ""),
              clock_out: obj.clock_out ? String(obj.clock_out) : null,
              user: userObj
                ? {
                    id: String(userObj.id ?? obj.user_id ?? ""),
                    name: typeof userObj.name === 'string' ? String(userObj.name) : null,
                    departement: typeof userObj.departement === 'string' ? String(userObj.departement) : null,
                    role: typeof userObj.role === 'string' ? String(userObj.role) : null,
                  }
                : undefined,
            } as AttendanceRecord;
          });
          setData(mapped);
        } else {
          setData([
            {
              attendance_id: "1",
              user_id: "demo-user",
              clock_in: new Date().toISOString(),
              clock_out: null,
            },
          ]);
        }
      } catch (err) {
        setError("An error occurred while fetching attendance data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchAttendance();
  }, []);

  const recordsByDate = React.useMemo(() => {
    const map = new Map<string, AttendanceRecord[]>();
    data.forEach((rec) => {
      const key = toDateKey(rec.clock_in);
      if (!key) return;
      const arr = map.get(key) ?? [];
      arr.push(rec);
      map.set(key, arr);
    });
    return map;
  }, [data]);

  const monthLabel = currentMonth.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const firstDayIndex = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const calendarCells: Array<Date | null> = [];
  for (let i = 0; i < firstDayIndex; i += 1) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    calendarCells.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  }

  const handlePrev = () => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  };

  const handleDayClick = (day: Date) => {
    if (selectedDate && sameDay(day, selectedDate)) {
      setSelectedDate(null);
      return;
    }
    setSelectedDate(day);
  };

  const selectedKey = selectedDate ? toDateKey(selectedDate) : "";
  const selectedAttendances = selectedKey ? recordsByDate.get(selectedKey) ?? [] : [];

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        height: "100%",
        bgcolor: "#f8fafc",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      <Box
        sx={{
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
          px: { xs: 2, sm: 3 },
          py: 4,
          flex: 1,
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            color="#0f172a"
            gutterBottom
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
          >
            Attendance Calendar 📅
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor daily employee attendance records and history.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress sx={{ color: "#2563eb" }} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              alignItems: "flex-start",
            }}
          >
            {/* Calendar Card Container (Sekarang dibuat lebih kecil/fix ukurannya) */}
            <Card
              elevation={0}
              sx={{
                width: { xs: "100%", md: "400px" },
                flexShrink: 0,
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                bgcolor: "#ffffff",
                p: { xs: 2, sm: 3 },
              }}
            >
              {/* Month Navigation Control */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  px: 1,
                }}
              >
                <Typography variant="h6" fontWeight={700} color="#1e293b">
                  {monthLabel}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    onClick={handlePrev}
                    size="small"
                    sx={{
                      border: "1px solid #cbd5e1",
                      borderRadius: 2,
                      color: "#334155",
                      "&:hover": { bgcolor: "#f8fafc", borderColor: "#94a3b8" },
                    }}
                  >
                    <ChevronLeft fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={handleNext}
                    size="small"
                    sx={{
                      border: "1px solid #cbd5e1",
                      borderRadius: 2,
                      color: "#334155",
                      "&:hover": { bgcolor: "#f8fafc", borderColor: "#94a3b8" },
                    }}
                  >
                    <ChevronRight fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Days Header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 1,
                  mb: 1,
                }}
              >
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
                  <Box
                    key={d}
                    sx={{
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      color: "#64748b",
                      py: 1,
                    }}
                  >
                    {d}
                  </Box>
                ))}
              </Box>

              {/* Calendar Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 1,
                }}
              >
                {calendarCells.map((day, idx) => {
                  if (!day) {
                    return <Box key={`empty-${idx}`} sx={{ minHeight: 48 }} />;
                  }

                  const key = toDateKey(day);
                  const has = recordsByDate.has(key);
                  const isSelected = selectedDate ? sameDay(day, selectedDate) : false;

                  return (
                    <Box
                      key={key}
                      onClick={() => handleDayClick(day)}
                      sx={{
                        border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        borderRadius: 2,
                        p: 1,
                        minHeight: 48,
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                        color: isSelected ? "#1d4ed8" : "#1e293b",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          borderColor: "#2563eb",
                          bgcolor: isSelected ? "#eff6ff" : "#f8fafc",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          fontWeight: isSelected ? 700 : 500,
                        }}
                      >
                        {day.getDate()}
                      </Typography>
                      {has && (
                        <Box
                          sx={{
                            alignSelf: "flex-end",
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: isSelected ? "#2563eb" : "#059669",
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Card>

            {/* Detail Panel Card (Sekarang dibuat flex: 1 / melebar) */}
            {selectedDate && (
              <Card
                elevation={0}
                sx={{
                  flex: 1,
                  width: "100%",
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                  p: 3,
                  boxSizing: "border-box",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2.5,
                    pb: 1.5,
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => setSelectedDate(null)}
                      sx={{
                        border: "1px solid #cbd5e1",
                        borderRadius: 2,
                        color: "#334155",
                        "&:hover": { bgcolor: "#f8fafc", borderColor: "#94a3b8" },
                      }}
                    >
                      <ArrowBack fontSize="small" />
                    </IconButton>
                    <Typography variant="subtitle1" fontWeight={700} color="#0f172a">
                      Attendance Details
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2.5,
                    color: "text.secondary",
                  }}
                >
                  <CalendarMonth sx={{ fontSize: 18, color: "#2563eb" }} />
                  <Typography variant="body2" fontWeight={600}>
                    {selectedDate.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>

                <TableContainer
                  sx={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 2,
                    maxHeight: "500px", // Diperbesar agar muat banyak saat layarnya lebar
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                          Name
                        </TableCell>
                        <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                          Department
                        </TableCell>
                        <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                          Time
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedAttendances.length > 0 ? (
                        selectedAttendances.map((r) => (
                          <TableRow key={r.attendance_id} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} color="#0f172a">
                                {r.user?.name ?? r.user_id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {r.user?.departement ?? "-"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={<AccessTime sx={{ fontSize: "14px !important" }} />}
                                label={`${formatTimeOnly(r.clock_in)}${
                                  r.clock_out ? ` - ${formatTimeOnly(r.clock_out)}` : ""
                                }`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderRadius: 1.5,
                                  fontSize: "0.75rem",
                                  color: "#0f172a",
                                  borderColor: "#e2e8f0",
                                  bgcolor: "#f8fafc",
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              Tidak ada data absensi pada tanggal ini.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ViewAttendance;