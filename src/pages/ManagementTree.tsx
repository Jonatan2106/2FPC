import React, { useEffect, useState } from "react";
import {
  SimpleTreeView,
  TreeItem,
} from "@mui/x-tree-view";
import {
  Box,
  Typography,
  Paper,
  ThemeProvider,
  createTheme,
  CircularProgress,
  Alert,
  Container,
  Chip,
  Button,
} from "@mui/material";
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";

const theme = createTheme({
  palette: {
    background: {
      default: "#f8fafc",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
  },
  typography: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
});

interface TreeNode {
  id: string;
  name: string;
  type: "department" | "user";
  role?: "Manager" | "Staff";
  permissions?: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
  children?: TreeNode[];
}

const ManagementTree: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const API_BASE_URL = `${BASE_URL}/api/web`;

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [deptRes, userRes] = await Promise.all([
          fetch(`${API_BASE_URL}/departements`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/admin/users`, { headers: getHeaders() }),
        ]);

        const deptData = await deptRes.json();
        const userData = await userRes.json();

        if (!deptRes.ok || !userRes.ok) {
          setError("Failed to load data");
          return;
        }

        const departments = deptData.data || [];
        const users = userData.data || [];

        const tree: TreeNode[] = departments.map((dept: any) => {
          const deptUsers = users
            .filter(
              (u: any) =>
                u.staff_detail?.departement_id === dept.departement_id
            )
            .sort((a: any, b: any) => {
              const roleA = a.staff_detail?.role;
              const roleB = b.staff_detail?.role;

              if (roleA === roleB) return 0;
              if (roleA === "Manager") return -1;
              if (roleB === "Manager") return 1;
              return 0;
            });

          return {
            id: dept.departement_id,
            name: dept.company_name || "Unknown Department", 
            type: "department",
            children: deptUsers.map((user: any) => ({
              id: user.user_id,
              name: user.name,
              type: "user",
              role: user.staff_detail?.role,
              permissions: {
                read: true,
                write: user.type === "Admin",
                delete: false,
              },
            })),
          };
        });

        setData(tree);
      } catch (err) {
        console.error(err);
        setError("Error loading tree");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderTree = (node: TreeNode) => (
    <TreeItem
      key={node.id}
      itemId={node.id}
      label={
        <Box sx={{ display: "flex", alignItems: "center", py: 1, gap: 1.5 }}>
          {node.type === "department" ? (
            <BusinessIcon sx={{ color: "#2563eb", fontSize: 20 }} />
          ) : (
            <PersonIcon sx={{ color: "#64748b", fontSize: 20 }} />
          )}

          <Typography
            variant="body1"
            sx={{
              fontWeight: node.type === "department" ? 600 : 500,
              color: node.type === "department" ? "#0f172a" : "#334155",
            }}
          >
            {node.name}
          </Typography>

          {node.type === "user" && node.role && (
            <Chip
              label={node.role}
              size="small"
              color={node.role === "Manager" ? "success" : "default"}
              sx={{ fontWeight: 500, borderRadius: 1.5, height: 22 }}
            />
          )}
        </Box>
      }
      sx={{
        "& .MuiTreeItem-content": {
          borderRadius: 2,
          py: 0.5,
          px: 1,
          my: 0.5,
          "&:hover": {
            backgroundColor: "#f1f5f9",
          },
        },
      }}
    >
      {node.children?.map(renderTree)}
    </TreeItem>
  );

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Navbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress sx={{ color: "#2563eb" }} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar />
        
        <Box 
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flexGrow: 1,
            px: { xs: 2, sm: 3 },
            py: { xs: 3, md: 5 },
            boxSizing: "border-box",
          }}
        >
          <Container maxWidth="md">
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                backgroundColor: "#ffffff",
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              }}
            >
              {/* Header dengan Flexbox agar Judul di kiri dan Tombol Edit Users di kanan */}
              <Box 
                sx={{ 
                  mb: 4, 
                  display: "flex", 
                  flexDirection: { xs: "column", sm: "row" }, 
                  justifyContent: "space-between", 
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 2 
                }}
              >
                <Box>
                  <Typography variant="h4" fontWeight={700} color="#0f172a" gutterBottom>
                    Management Tree 🏢
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Explore the organizational hierarchy, departments, and assigned roles
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  size="medium"
                  startIcon={<EditIcon />}
                  onClick={() => navigate("/users")}
                  sx={{
                    py: 1,
                    px: 2.5,
                    borderRadius: 2.5,
                    fontWeight: 600,
                    textTransform: "none",
                    borderColor: "#cbd5e1",
                    color: "#334155",
                    bgcolor: "#ffffff",
                    whiteSpace: "nowrap",
                    "&:hover": { bgcolor: "#f8fafc", borderColor: "#94a3b8" },
                  }}
                >
                  Edit Users
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ mt: 2 }}>
                <SimpleTreeView
                  slots={{
                    expandIcon: ChevronRightIcon,
                    collapseIcon: ExpandMoreIcon,
                  }}
                >
                  {data.map(renderTree)}
                </SimpleTreeView>
              </Box>
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ManagementTree;