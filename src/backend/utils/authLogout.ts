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

export const logoutWeb = () => {
  clearAuthStorage();
  window.location.assign("/");
};
