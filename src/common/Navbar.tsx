import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { User } from "../types/user";
import { logoutWeb } from "../backend/utils/authLogout";

interface NavbarProps {
  user: User;
}


const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const navigate = useNavigate();
  const isAdmin = user.type === "Admin";

  const navItems = [
    { label: "Reimburse", path: "/reimburse-list" },
    { label: "Leave", path: "/leave-management-list" },
    { label: "Attendance", path: "/attendance-view" },
    { label: "Profile", path: "/profile" },
    ...(isAdmin
      ? [
          { label: "Users", path: "/create-account" },
          { label: "Payroll", path: "/payroll" },
        ]
      : []),
    { label: "Logout", action: "logout" },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        backgroundColor: "transparent",
        boxSizing: "border-box",
      }}
    >
      {/* Logo */}
      <Typography
        variant="h6"
        sx={{ cursor: "pointer", color: "#000" }}
        onClick={() => navigate("/")}
      >
        2FPC
      </Typography>

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          whiteSpace: "nowrap",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {navItems.map((item) => (
          <Button
            key={item.label}
            onClick={() => {
              if ("action" in item && item.action === "logout") {
                logoutWeb();
                
              } else {
                navigate(item.path!);
              }
            }}
            sx={{
              color: "#000",
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: "transparent",
                color: "#1976d2",
              },
              textTransform: "none",
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default Navbar;