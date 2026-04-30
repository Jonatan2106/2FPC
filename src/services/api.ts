const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/web";

export const getToken = () => {
  return localStorage.getItem("authToken");
};

export const setToken = (token: string) => {
  localStorage.setItem("authToken", token);
};

export const removeToken = () => {
  localStorage.removeItem("authToken");
};

const getHeaders = () => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Auth APIs
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
      method: "GET",
      headers: getHeaders(),
    });
    const data = await response.json();
    if (response.ok) {
      setToken(data.data.token);
    }
    return data;
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: getHeaders(),
    });
    removeToken();
    return response.json();
  },

  resetPassword: async (userId: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/reset-password`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ password: newPassword }),
    });
    return response.json();
  },
};

// User APIs
export const userApi = {
  createStaffAccount: async (username: string, role: "Staff" | "Manager" = "Staff") => {
    const response = await fetch(`${API_BASE_URL}/admin/users/staff-account`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ username, role }),
    });
    return response.json();
  },

  updateUserProfile: async (userId: string, payload: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  updateOwnProfile: async (userId: string, alamat: string, nomor_telepon: string, foto?: string) => {
    const response = await fetch(`${API_BASE_URL}/staff/users/${userId}/profile`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        alamat,
        nomor_telepon,
        ...(foto && { foto }),
      }),
    });
    return response.json();
  },
};

// Attendance APIs
export const attendanceApi = {
  generateQr: async () => {
    const response = await fetch(`${API_BASE_URL}/attendance/qr`, {
      method: "GET",
      headers: getHeaders(),
    });
    return response.json();
  },

  clockInByQr: async (qrData: string) => {
    const response = await fetch(`${API_BASE_URL}/attendance/clock-in/qr-scan`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ qrData }),
    });
    return response.json();
  },

  getAttendanceData: async () => {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: "GET",
      headers: getHeaders(),
    });
    return response.json();
  },

  clockOut: async (attendanceId: string) => {
    const response = await fetch(`${API_BASE_URL}/attendance/${attendanceId}/clock-out`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.json();
  },

  updateAttendance: async (attendanceId: string, payload: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/admin/attendance/${attendanceId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return response.json();
  },
};

// Leave Management APIs
export const leaveApi = {
  createLeaveRequest: async (startDate: string, endDate: string, reason: string) => {
    const response = await fetch(`${API_BASE_URL}/leave-requests`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ startDate, endDate, reason }),
    });
    return response.json();
  },

  approveOrDeclineLeave: async (leaveId: string, decision: "approved" | "declined", notes?: string) => {
    const response = await fetch(`${API_BASE_URL}/manager/leave-requests/${leaveId}/decision`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ decision, notes }),
    });
    return response.json();
  },

  getLeaveTimeline: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/leave-requests/timeline`, {
      method: "GET",
      headers: getHeaders(),
    });
    return response.json();
  },
};

// Reimburse APIs
export const reimburseApi = {
  createReimburseRequest: async (amount: number, evidence: string) => {
    const response = await fetch(`${API_BASE_URL}/reimburse-requests`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ amount, evidence }),
    });
    return response.json();
  },

  approveOrDeclineReimburse: async (reimburseId: string, decision: "approved" | "declined", notes?: string) => {
    const response = await fetch(`${API_BASE_URL}/manager/reimburse-requests/${reimburseId}/decision`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ decision, notes }),
    });
    return response.json();
  },
};

// Penalty APIs
export const penaltyApi = {
  createPenaltyRequest: async (amount: number, evidence: string) => {
    const response = await fetch(`${API_BASE_URL}/penalty-requests`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ amount, evidence }),
    });
    return response.json();
  },
};