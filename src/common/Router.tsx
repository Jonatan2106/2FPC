import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProfileManagement from "../pages/ProfileManagement";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import type { User } from "../types/user";
import CreateUser from "../pages/CreateAccountAdmin";
import LeaveRequest from "../pages/LeaveManagementRequest";
import ViewAttendance from "../pages/AttendanceView";
import ReimburseList from "../reimburse/ReimburseList";
import CreateReimburse from "../reimburse/CreateReimburse";

const dummyUser: User = {
  user_id: "u001",
  name: "John Doe",
  email: "john.doe@example.com",
  password: "secret",
  alamat: "123 Main St",
  nomor_telepon: "123-456-7890",
  foto: null,
  salary: 5000,
  type: "Admin",
};

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/profile"
          element={<ProfileManagement userData={dummyUser} />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="*"
          element={
            <div style={{ padding: "20px", textAlign: "center" }}>
              <h2>404 - Page Not Found</h2>
              <p>The page you are looking for does not exist.</p>
            </div>
          }
        />
        <Route path="/reimburse-list" element={<ReimburseList />} />
        <Route path="/request-reimburse" element={<CreateReimburse />} />
        <Route path="/create-account" element={<CreateUser />} />
        <Route path="/leave-request" element={<LeaveRequest />} />
        <Route path="/attendance-view" element={<ViewAttendance />} />
      </Routes>
    </BrowserRouter>
  );
}