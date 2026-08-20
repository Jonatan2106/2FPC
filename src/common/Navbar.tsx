import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  if (!user) return null;

  const u = user as any;
  const isAdmin = u?.type === "Admin";

  const navItems = [
    { label: "Reimburse", path: "/reimburse-list" },
    { label: "Leave", path: "/leave-management-list" },
    { label: "Attendance", path: "/attendance-view" },
    { label: "Profile", path: "/profile" },
    ...(isAdmin
      ? [
          { label: "Create Users", path: "/create-account" },
          { label: "Payroll", path: "/payroll" },
        ]
      : []),
    { label: "Logout", action: "logout" as const },
  ];

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleNavigation = (item: typeof navItems[0]) => {
    handleCloseNavMenu();
    if ("action" in item && item.action === "logout") {
      logout();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e2e8f0",
        color: "#0f172a",
        zIndex: 1000,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: "70px" }}>
          <Typography
            variant="h5"
            noWrap
            onClick={() => navigate("/")}
            sx={{
              mr: 4,
              display: { xs: "none", md: "flex" },
              fontWeight: 800,
              letterSpacing: ".1rem",
              color: "#1e293b",
              cursor: "pointer",
            }}
          >
            2FPC
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {navItems.map((item) => (
                <MenuItem key={item.label} onClick={() => handleNavigation(item)}>
                  <Typography
                    textAlign="center"
                    fontWeight={500}
                    color={item.label === "Logout" ? "error" : "inherit"}
                  >
                    {item.label}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Typography
            variant="h6"
            noWrap
            onClick={() => navigate("/")}
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontWeight: 800,
              letterSpacing: ".1rem",
              color: "#1e293b",
              cursor: "pointer",
            }}
          >
            2FPC
          </Typography>

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.label}
                onClick={() => handleNavigation(item)}
                sx={{
                  my: 2,
                  color: item.label === "Logout" ? "#ef4444" : "#475569",
                  display: "block",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  px: 2,
                  borderRadius: 2,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: item.label === "Logout" ? "#fef2f2" : "#f1f5f9",
                    color: item.label === "Logout" ? "#dc2626" : "#0f172a",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;