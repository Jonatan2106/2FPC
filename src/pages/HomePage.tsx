import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Skeleton,
  Alert,
  Divider,
} from "@mui/material";
import {
  ReceiptLong,
  EventBusy,
  HowToReg,
  Person,
  AccountTree,
  Gavel,
  Schedule,
  PersonAdd,
  Payments,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";

interface HomePageProps {
  user: any;
}

interface ActivityItem {
  id: string;
  userName: string;
  description: string;
  requestedAt: string;
}

const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const navigate = useNavigate();

  // Cukup cek apakah type user adalah "Admin"
  const u = user as any;
  const isAdmin = u?.type === "Admin";

  const [kpis, setKpis] = React.useState({
    pendingReimburse: 0,
    pendingLeave: 0,
    attendanceToday: 0,
  });
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [loadingKpis, setLoadingKpis] = React.useState(true);
  const [kpiError, setKpiError] = React.useState("");
  const [activityError, setActivityError] = React.useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const API_BASE_URL = `${BASE_URL}/api/web`;

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  React.useEffect(() => {
    const fetchKpisAndActivity = async () => {
      try {
        const [reimburseRes, leaveRes, attendanceRes, activityRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/pending-reimburse-requests`, { headers: getHeaders() }),
            fetch(`${API_BASE_URL}/pending-leave-requests`, { headers: getHeaders() }),
            fetch(`${API_BASE_URL}/attendance`, { headers: getHeaders() }),
            fetch(`${API_BASE_URL}/pending-requests-activity`, { headers: getHeaders() }),
          ]);

        const [reimburseData, leaveData, attendanceData, activityData] =
          await Promise.all([
            reimburseRes.json(),
            leaveRes.json(),
            attendanceRes.json(),
            activityRes.json(),
          ]);

        if (!reimburseRes.ok || !leaveRes.ok || !attendanceRes.ok || !activityRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        setKpis({
          pendingReimburse: Number(reimburseData?.data?.pendingReimburseCount ?? 0),
          pendingLeave: Number(leaveData?.data?.pendingLeaveCount ?? 0),
          attendanceToday: Array.isArray(attendanceData?.data) ? attendanceData.data.length : 0,
        });

        const activityItems = Array.isArray(activityData?.data)
          ? activityData.data.map((item: any) => ({
              id: String(item.id),
              userName: item.userName ?? "Unknown",
              description: item.description ?? "Pending request",
              requestedAt: item.requestedAt ?? "",
            }))
          : [];

        setActivities(activityItems);
      } catch (error) {
        console.error(error);
        setKpiError("Unable to load dashboard KPI data.");
        setActivityError("Unable to load pending request activity.");
      } finally {
        setLoadingKpis(false);
      }
    };

    void fetchKpisAndActivity();
  }, []);

  const kpiDataList = [
    ...(isAdmin
      ? [
          {
            label: "Create User",
            value: "shortcut",
            icon: <PersonAdd sx={{ fontSize: 22, color: "#9333ea" }} />,
            bgColor: "#faf5ff",
            path: "/create-account",
          },
        ]
      : []),
    {
      label: "Pending Reimburse",
      value: kpis.pendingReimburse,
      icon: <ReceiptLong sx={{ fontSize: 22, color: "#2563eb" }} />,
      bgColor: "#eff6ff",
      path: "/reimburse-list",
    },
    {
      label: "Pending Leave",
      value: kpis.pendingLeave,
      icon: <EventBusy sx={{ fontSize: 22, color: "#d97706" }} />,
      bgColor: "#fffbeb",
      path: "/leave-management-list",
    },
    {
      label: "Attendance Today",
      value: kpis.attendanceToday,
      icon: <HowToReg sx={{ fontSize: 22, color: "#059669" }} />,
      bgColor: "#ecfdf5",
      path: "/attendance-view",
    },
    ...(isAdmin
      ? [
          {
            label: "Payroll",
            value: "shortcut",
            icon: <Payments sx={{ fontSize: 22, color: "#0891b2" }} />,
            bgColor: "#ecfeff",
            path: "/payroll",
          },
        ]
      : []),
  ];

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
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h4"
            fontWeight={700}
            color="#0f172a"
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
          >
            Welcome back, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Here is an overview of today's activities and pending requests.
          </Typography>
        </Box>

        {kpiError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {kpiError}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2.5,
            mb: 4,
            justifyContent: "center",
          }}
        >
          {kpiDataList.map((kpi) => (
            <Card
              key={kpi.label}
              elevation={0}
              onClick={() => navigate(kpi.path)}
              sx={{
                width: { xs: "100%", sm: "185px" },
                height: { xs: "160px", sm: "185px" },
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                bgcolor: "#ffffff",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
                  borderColor: "#cbd5e1",
                },
              }}
            >
              <CardContent
                sx={{
                  p: 2.5,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                  "&:last-child": { pb: 2.5 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{
                      fontSize: "0.8rem",
                      lineHeight: 1.2,
                      maxWidth: "65%",
                      height: "2.4em",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {kpi.label}
                  </Typography>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: kpi.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {kpi.icon}
                  </Box>
                </Box>

                <Box>
                  {kpi.value === "shortcut" ? (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ArrowForward sx={{ color: "#94a3b8", fontSize: 26 }} />
                    </Box>
                  ) : loadingKpis ? (
                    <Skeleton width="40%" height={30} />
                  ) : (
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color="#0f172a"
                      sx={{ fontSize: "1.8rem" }}
                    >
                      {kpi.value}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* 
          Bagian Grid diganti menjadi Box Flexbox yang responsive.
          - flexDirection: di mobile (xs) menyusun tombol ke bawah, di desktop/tablet (sm) menyamping.
          - gap: memberi jarak antar tombol.
          - flex: 1 membuat ketiga tombol memiliki lebar yang proporsional sama.
        */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 5,
            ml: 20,
            justifyContent: "center",
            width: "70%",
          }}
        >x
          <Box sx={{ flex: 1 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<AccountTree />}
              onClick={() => navigate("/management-tree")}
              sx={{
                py: 1.2,
                borderRadius: 2.5,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "none",
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
              }}
            >
              View Management Tree
            </Button>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              color="error"
              startIcon={<Gavel />}
              onClick={() => navigate("/penalty-requests")}
              sx={{
                py: 1.2,
                borderRadius: 2.5,
                fontWeight: 600,
                textTransform: "none",
                bgcolor: "#ffffff",
                "&:hover": { bgcolor: "#fef2f2" },
              }}
            >
              Penalty Requests
            </Button>
          </Box>
        </Box>

        {/* Activity Log */}
        <Box sx={{ width: "100%", pb: 6 }}>
          <Typography variant="h6" fontWeight={700} color="#1e293b" mb={2} textAlign="center">
            Pending Request Activity Log
          </Typography>

          {activityError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {activityError}
            </Alert>
          )}

          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              p: { xs: 2, sm: 3 },
              bgcolor: "#ffffff",
            }}
          >
            {loadingKpis ? (
              <Box sx={{ p: 2 }}>
                <Skeleton height={50} sx={{ mb: 1 }} />
                <Skeleton height={50} sx={{ mb: 1 }} />
                <Skeleton height={50} />
              </Box>
            ) : activities.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                No pending requests found.
              </Typography>
            ) : (
              activities.map((item, index) => (
                <React.Fragment key={item.id}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      py: 1.8,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: "#e2e8f0",
                          color: "#475569",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        {item.userName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
                          {item.userName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>

                    {item.requestedAt && (
                      <Chip
                        icon={<Schedule sx={{ fontSize: "16px !important" }} />}
                        label={new Date(item.requestedAt).toLocaleString()}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: 1.5,
                          color: "text.secondary",
                          borderColor: "#e2e8f0",
                          alignSelf: { xs: "flex-start", sm: "center" },
                        }}
                      />
                    )}
                  </Box>
                  {index < activities.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;