import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import type { User } from "../types/user";
import Navbar from "../common/Navbar";

// Mock Data
const mockKPIs = { pendingReimburse: 3, pendingLeave: 2, attendanceToday: 45 };
const mockActivities = [
  { id: 1, activity: "John submitted leave request", date: new Date() },
  { id: 2, activity: "Anna uploaded reimburse evidence", date: new Date() },
  { id: 3, activity: "Payroll processed for March", date: new Date() },
];

interface HomePageProps { user: User }

const HomePage: React.FC<HomePageProps> = ({ user }) => {
  return (
    <Box>
      <Navbar/>

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={600} mb={4}>
          Welcome, {user.name}!
        </Typography>

        {/* KPI Cards */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
          {[
            { label: "Pending Reimburse", value: mockKPIs.pendingReimburse },
            { label: "Pending Leave", value: mockKPIs.pendingLeave },
            { label: "Attendance Today", value: mockKPIs.attendanceToday },
          ].map((kpi) => (
            <Card key={kpi.label} sx={{ flex: "1 1 250px", minWidth: 200, bgcolor: "#fff" }}>
              <CardContent>
                <Typography variant="h6">{kpi.label}</Typography>
                <Typography variant="h4" fontWeight={600}>{kpi.value}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Recent Activities */}
        <Typography variant="h5" fontWeight={600} mb={2}>Recent Activities</Typography>
        <Card sx={{ mb: 4, bgcolor: "#fff" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Activity</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockActivities.map((act) => (
                <TableRow key={act.id}>
                  <TableCell>{act.activity}</TableCell>
                  <TableCell>{act.date.toLocaleDateString()} {act.date.toLocaleTimeString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Calendar */}
        <Typography variant="h5" fontWeight={600} mb={2}>Calendar</Typography>
        <Card sx={{ height: 300, bgcolor: "#fff" }}>
          <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
            Calendar Widget Placeholder
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default HomePage;