import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProfileManagement from "../pages/ProfileManagement";

import type { User } from "../types/user";

const dummyUser: User = {
  user_id: "u001",
  name: "John Doe",
  email: "john.doe@example.com",
  password: "secret",
  alamat: "123 Main St",
  nomor_telepon: "123-456-7890",
  foto: null,
  type: "ADMIN",
};

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/profile"
          element={<ProfileManagement userData={dummyUser} />}
        />
      </Routes>
    </BrowserRouter>
  );
}