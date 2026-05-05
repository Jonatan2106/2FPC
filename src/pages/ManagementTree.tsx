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
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Navbar from "../common/Navbar";

const theme = createTheme({
  palette: {
    background: {
      default: "#ffffff",
    },
    text: {
      primary: "#37352f",
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
  const [data, setData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = "http://localhost:8080/api/web";

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [deptRes, userRes] = await Promise.all([
          fetch(`${API_BASE_URL}/departments`, { headers: getHeaders() }),
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
          const deptUsers = users.filter(
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
            name: dept.name,
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
        <Box sx={{ display: "flex", alignItems: "center", p: 1 }}>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {node.name}
          </Typography>

          {node.type === "user" && node.role && (
            <Typography
              variant="caption"
              sx={{
                mr: 2,
                px: 1,
                py: 0.2,
                borderRadius: 1,
                bgcolor: node.role === "Manager" ? "#d1e7ff" : "#eee",
              }}
            >
              {node.role}
            </Typography>
          )}

        </Box>
      }
    >
      {node.children?.map(renderTree)}
    </TreeItem>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Navbar />
      <Paper sx={{ p: 3, m: 2, minHeight: "80vh" }}>
        <Typography variant="h4" gutterBottom>
          Management Tree
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Company structure by department and role
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <SimpleTreeView
          slots={{
            expandIcon: ChevronRightIcon,
            collapseIcon: ExpandMoreIcon,
          }}
          sx={{ mt: 2 }}
        >
          {data.map(renderTree)}
        </SimpleTreeView>
      </Paper>
    </ThemeProvider>
  );
};

export default ManagementTree;