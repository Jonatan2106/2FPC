import React, { useState } from 'react';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { Box, Typography, Checkbox, FormControlLabel, Paper, ThemeProvider, createTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const theme = createTheme({
  palette: {
    background: {
      default: '#ffffff',
    },
    text: {
      primary: '#37352f',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
});

interface Permission {
  read: boolean;
  write: boolean;
  delete: boolean;
}

interface TreeNode {
  id: string;
  name: string;
  permissions: Permission;
  children?: TreeNode[];
}

const sampleData: TreeNode = {
  id: 'root',
  name: 'Organization',
  permissions: { read: true, write: true, delete: true },
  children: [
    {
      id: 'dept1',
      name: 'Department 1',
      permissions: { read: true, write: false, delete: false },
      children: [
        { id: 'user1', name: 'User 1', permissions: { read: true, write: true, delete: false } },
        { id: 'user2', name: 'User 2', permissions: { read: true, write: false, delete: false } },
      ],
    },
    {
      id: 'dept2',
      name: 'Department 2',
      permissions: { read: true, write: true, delete: false },
      children: [
        { id: 'user3', name: 'User 3', permissions: { read: true, write: true, delete: true } },
      ],
    },
  ],
};

const ManagementTree: React.FC = () => {
  const [data, setData] = useState<TreeNode>(sampleData);

  const handlePermissionChange = (nodeId: string, perm: keyof Permission) => {
    const updateNode = (node: TreeNode): TreeNode => {
      if (node.id === nodeId) {
        return {
          ...node,
          permissions: { ...node.permissions, [perm]: !node.permissions[perm] },
        };
      }
      if (node.children) {
        return { ...node, children: node.children.map(updateNode) };
      }
      return node;
    };
    setData(updateNode);
  };

  const renderTree = (node: TreeNode) => (
    <TreeItem
      key={node.id}
      itemId={node.id}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
          <Typography variant="body1" sx={{ mr: 2 }}>{node.name}</Typography>
          <FormControlLabel
            control={<Checkbox checked={node.permissions.read} onChange={() => handlePermissionChange(node.id, 'read')} />}
            label="Read"
          />
          <FormControlLabel
            control={<Checkbox checked={node.permissions.write} onChange={() => handlePermissionChange(node.id, 'write')} />}
            label="Write"
          />
          <FormControlLabel
            control={<Checkbox checked={node.permissions.delete} onChange={() => handlePermissionChange(node.id, 'delete')} />}
            label="Delete"
          />
        </Box>
      }
    >
      {node.children?.map(renderTree)}
    </TreeItem>
  );

  return (
    <ThemeProvider theme={theme}>
      <Paper sx={{ p: 3, m: 2, minHeight: '80vh' }}>
        <Typography variant="h4" gutterBottom>Management Tree</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Configure user access based on organizational structure and permissions.
        </Typography>
        <SimpleTreeView
          slots={{
            expandIcon: ChevronRightIcon,
            collapseIcon: ExpandMoreIcon,
          }}
          sx={{ mt: 2 }}
        >
          {renderTree(data)}
        </SimpleTreeView>
      </Paper>
    </ThemeProvider>
  );
};

export default ManagementTree;