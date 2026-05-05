import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import type { User } from "../types/user";
import Navbar from "../common/Navbar";

interface HomePageProps { user: User }

interface ActivityItem {
  id: string;
  userName: string;
  description: string;
  requestedAt: string;
}

const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const [kpis, setKpis] = React.useState({ pendingReimburse: 0, pendingLeave: 0, attendanceToday: 0 });
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [loadingKpis, setLoadingKpis] = React.useState(true);
  const [kpiError, setKpiError] = React.useState("");
  const [activityError, setActivityError] = React.useState("");

  const API_BASE_URL = "http://localhost:8080/api/web";

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  React.useEffect(() => {
    const fetchKpisAndActivity = async () => {
      try {
        const [reimburseRes, leaveRes, attendanceRes, activityRes] = await Promise.all([
          fetch(`${API_BASE_URL}/pending-reimburse-requests`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/pending-leave-requests`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/attendance`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/pending-requests-activity`, { headers: getHeaders() }),
        ]);

        const [reimburseData, leaveData, attendanceData, activityData] = await Promise.all([
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

  return (
    <Box>
      <Navbar/>

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={600} mb={4}>
          Welcome, {user.name}!
        </Typography>

        {/* KPI Cards */}
        {kpiError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {kpiError}
          </Typography>
        )}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
          {[
            { label: "Pending Reimburse", value: loadingKpis ? "..." : kpis.pendingReimburse },
            { label: "Pending Leave", value: loadingKpis ? "..." : kpis.pendingLeave },
            { label: "Attendance Today", value: loadingKpis ? "..." : kpis.attendanceToday },
          ].map((kpi) => (
            <Card key={kpi.label} sx={{ flex: "1 1 250px", minWidth: 200, bgcolor: "#fff" }}>
              <CardContent>
                <Typography variant="h6">{kpi.label}</Typography>
                <Typography variant="h4" fontWeight={600}>{kpi.value}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between", mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            sx={{ minWidth: 200, flex: "1 1 250px" }}
            onClick={() => { window.location.href = "/users"; }}
          >
            Edit Profile
          </Button>
          <Button
            variant="contained"
            size="large"
            sx={{ minWidth: 200, flex: "1 1 250px" }}
            onClick={() => { window.location.href = "/management-tree"; }}
          >
            View Management Tree
          </Button>
          <Button
            variant="contained"
            size="large"
            sx={{ minWidth: 200, flex: "1 1 250px" }}
            onClick={() => { window.location.href = "/penalty-requests"; }}
          >
            Penalty
          </Button>
        </Box>

        <Box>
          <Typography variant="h5" fontWeight={600} mb={2}>
            Pending Request Activity Log
          </Typography>
          {activityError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {activityError}
            </Typography>
          )}
          <Card sx={{ bgcolor: "#fff", p: 2 }}>
            {loadingKpis ? (
              <Typography>Loading pending requests...</Typography>
            ) : activities.length === 0 ? (
              <Typography>No pending requests found.</Typography>
            ) : (
              activities.map((item) => (
                <Box key={item.id} sx={{ mb: 2, p: 2, borderRadius: 1, border: "1px solid #e0e0e0" }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {item.userName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {item.description}
                  </Typography>
                  {item.requestedAt && (
                    <Typography variant="caption" color="textSecondary">
                      {new Date(item.requestedAt).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              ))
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;