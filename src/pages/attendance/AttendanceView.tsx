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
  Paper,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
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

  // Group records by date (yyyy-MM-dd)
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
    // Toggle detail panel: click same date again to close.
    if (selectedDate && sameDay(day, selectedDate)) {
      setSelectedDate(null);
      return;
    }
    setSelectedDate(day);
  };

  const selectedKey = selectedDate ? toDateKey(selectedDate) : "";
  const selectedAttendances = selectedKey ? recordsByDate.get(selectedKey) ?? [] : [];

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#ffffff', px: 2, py: 4 }}>
      <Navbar />
      <Typography variant="h5" fontWeight={600} mb={3}>Attendance Calendar</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: 'flex-start'
          }}
        >
          {/* Calendar column */}
          <Box
            sx={{
              flex: 1,
              width: '100%',
              maxWidth: { xs: '100%', md: selectedDate ? '68%' : '100%' },
              transition: 'max-width 300ms ease, transform 300ms ease',
              transform: { xs: 'none', md: selectedDate ? 'translateX(-12px)' : 'translateX(0)' }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <IconButton onClick={handlePrev} size="small" sx={{ color: '#111' }}>◀</IconButton>
                <IconButton onClick={handleNext} size="small" sx={{ color: '#111' }}>▶</IconButton>
              </Box>
              <Typography variant="h6" sx={{ color: '#111' }}>{monthLabel}</Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.75 }}>
              {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map((d) => (
                <Box
                  key={d}
                  sx={{
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: 15,
                    color: '#111',
                    backgroundColor: 'transparent',
                    py: 0.5
                  }}
                >
                  {d}
                </Box>
              ))}

              {calendarCells.map((day, idx) => {
                if (!day) {
                  return <Box key={`empty-${idx}`} sx={{ minHeight: 56 }} />;
                }

                const key = toDateKey(day);
                const has = recordsByDate.has(key);
                const isSelected = selectedDate ? sameDay(day, selectedDate) : false;

                return (
                  <Box
                    key={key}
                    onClick={() => handleDayClick(day)}
                    sx={{
                      border: '1px solid #d9d9d9',
                      p: 0.75,
                      minHeight: 56,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#111' : '#fff',
                      color: isSelected ? '#fff' : '#111',
                      position: 'relative'
                    }}
                  >
                    <Typography sx={{ fontSize: 14, lineHeight: 1.1 }}>{day.getDate()}</Typography>
                    {has && <Box sx={{ position: 'absolute', top: 4, right: 4, bgcolor: isSelected ? '#fff' : '#111', color: isSelected ? '#111' : '#fff', px: 0.5, borderRadius: 1, fontSize: 10, lineHeight: 1 }}>•</Box>}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Detail panel */}
          <Box
            sx={{
              width: { xs: '100%', md: selectedDate ? 360 : 0 },
              overflow: 'visible',
              transition: 'width 300ms ease'
            }}
          >
            {selectedDate && (
              <Paper
                sx={{
                  p: 1.5,
                  width: '100%',
                  maxWidth: { xs: '100%', md: 360 },
                  border: '1px solid #111',
                  boxSizing: 'border-box'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <IconButton size="small" onClick={() => setSelectedDate(null)} sx={{ color: '#111' }}>←</IconButton>
                  <Typography variant="h6">
                    {selectedDate.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><b>Name</b></TableCell>
                        <TableCell><b>Department</b></TableCell>
                        <TableCell><b>Time</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedAttendances.length > 0 ? (
                        selectedAttendances.map((r) => (
                          <TableRow key={r.attendance_id}>
                            <TableCell>
                              <Typography fontWeight={600}>{r.user?.name ?? r.user_id}</Typography>
                            </TableCell>
                            <TableCell>{r.user?.departement ?? '-'}</TableCell>
                            <TableCell>
                              {formatTimeOnly(r.clock_in)}
                              {r.clock_out ? ` - ${formatTimeOnly(r.clock_out)}` : ""}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            Tidak ada data absensi pada tanggal ini.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ViewAttendance;