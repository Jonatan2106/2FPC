import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileManagement from "../pages/profile/ProfileManagement";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import type { User } from "../types/user";
import CreateUser from "../pages/profile/CreateAccountAdmin";
import LeaveRequest from "../pages/leave/LeaveManagementRequest";
import ViewAttendance from "../pages/attendance/AttendanceView";
import ReimburseList from "../pages/reimburse/ReimburseList";
import CreateReimburse from "../pages/reimburse/CreateReimburse";
import HomePage from "../pages/HomePage";
import LeaveManagement from "../pages/leave/LeaveManagement";
import Payroll from "../pages/payment/Payroll";
import Penalty from "../pages/payment/Penalty";
import ViewLeave from "../pages/leave/ViewLeave";
import ManagementTree from "../pages/ManagementTree";

export function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Loading...
      </div>
    );
  }

  const displayUser: User = user || {
    user_id: "default",
    name: "User",
    email: "user@company.local",
    password: "",
    alamat: "",
    nomor_telepon: "",
    foto: null,
    salary: 0,
    type: "Staff",
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/penalty-requests" element={<Penalty />} />
        <Route path="/view-leave" element={<ViewLeave />} />
        <Route path="/management-tree" element={<ManagementTree />} />


        {/* Protected Routes */}
        {isAuthenticated ? (
          <>
            <Route path="/" element={<HomePage user={displayUser} />} />
            <Route path="/profile" element={<ProfileManagement userData={displayUser} />} />
            <Route path="/reimburse-list" element={<ReimburseList />} />
            <Route path="/reimburse" element={<CreateReimburse />} />
            <Route path="/create-account" element={<CreateUser />} />
            <Route path="/leave-request" element={<LeaveRequest />} />
            <Route path="/attendance-view" element={<ViewAttendance />} />
            <Route path="/leave-management-list" element={<LeaveManagement />} />
            <Route path="/dashboard" element={<HomePage user={displayUser} />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div style={{ padding: "20px", textAlign: "center" }}>
              <h2>404 - Page Not Found</h2>
              <p>The page you are looking for does not exist.</p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}