const API_URL = import.meta.env.VITE_API_URL;

export const AUTH_STORAGE_KEYS = [
  "token",
  "authToken",
  "accessToken",
  "user",
  "currentUser",
  "user_id",
];

export const clearAuthStorage = () => {
  for (const key of AUTH_STORAGE_KEYS) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
};

export const logoutWeb = async () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken");

  try {
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error("Logout API failed:", error);
  } finally {
    clearAuthStorage();
    window.location.href = "/login";
  }
};