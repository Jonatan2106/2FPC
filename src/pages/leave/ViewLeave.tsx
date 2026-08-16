import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Alert, Box, Button, Typography, Card, CardContent } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { LeaveManagements } from '../../types/leave_management';

const ViewLeave: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [leave, setLeave] = useState<LeaveManagements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const API_BASE_URL = `${BASE_URL}/api/web`;

  useEffect(() => {
    const fetchLeaveTimeline = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/admin/leave-requests/timeline`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch leave timeline");
        }

        const result = await response.json();
        setLeave(result.data || result); 
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLeaveTimeline();
    } else {
      setError("No Leave ID provided");
      setLoading(false);
    }
  }, [id]);

  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f8fafc">
        <CircularProgress sx={{ color: "#2563eb" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        p: { xs: 2, sm: 4 },
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ 
            mb: 3, 
            color: '#2563eb', 
            fontWeight: 600, 
            textTransform: 'none',
            "&:hover": { bgcolor: "transparent", color: "#1d4ed8" } 
          }}
        >
          Back to Leave List
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {leave && (
          <Card
            elevation={0}
            sx={{
              p: { xs: 2, sm: 4 },
              backgroundColor: '#ffffff',
              borderRadius: 3,
              border: '1px solid #e2e8f0',
            }}
          >
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} color="#0f172a" gutterBottom>
                  Leave Timeline ⏳
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Tracking details for Request <Box component="strong" color="#0f172a">#{id?.slice(-6).toUpperCase()}</Box>
                </Typography>
              </Box>

              <Box sx={{ position: 'relative' }}>
                {/* Vertical Connector Line */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: '31px',
                    top: '40px',
                    bottom: '40px',
                    width: '2px',
                    backgroundColor: '#e2e8f0',
                    zIndex: 0,
                  }}
                />

                {/* Step 1: Creation */}
                <Box sx={{ display: 'flex', gap: 3, mb: 4, position: 'relative', zIndex: 1 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2.5,
                      backgroundColor: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '4px solid #ffffff',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                      fontSize: '24px',
                      flexShrink: 0,
                    }}
                  >
                    📝
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      p: 3,
                      borderRadius: 2.5,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ letterSpacing: '0.1em', fontWeight: 700, color: '#64748b' }}>
                        SUBMISSION
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#0f172a" sx={{ mb: 0.5 }}>
                      {formatDateTime(leave.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Request successfully created by User ID: {leave.user_id}
                    </Typography>
                  </Box>
                </Box>

                {/* Step 2: Approval */}
                <Box sx={{ display: 'flex', gap: 3, position: 'relative', zIndex: 1 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2.5,
                      backgroundColor: leave.approvedAt ? '#dcfce7' : '#fff7ed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '4px solid #ffffff',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                      fontSize: '24px',
                      flexShrink: 0,
                    }}
                  >
                    {leave.approvedAt ? '✅' : '⏳'}
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      p: 3,
                      borderRadius: 2.5,
                      backgroundColor: '#ffffff',
                      border: leave.approvedAt ? '2px solid #22c55e' : '1px solid #e2e8f0',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ letterSpacing: '0.1em', fontWeight: 700, color: '#64748b' }}>
                        MANAGER APPROVAL
                      </Typography>
                      <Box
                        sx={{
                          py: 0.5,
                          px: 1.5,
                          borderRadius: 999,
                          backgroundColor: leave.approvedAt ? '#dcfce7' : '#fef3c7',
                          color: leave.approvedAt ? '#15803d' : '#92400e',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                        }}
                      >
                        {leave.approvedAt ? 'COMPLETED' : 'PENDING'}
                      </Box>
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#0f172a" sx={{ mb: 0.5 }}>
                      {leave.approvedAt ? formatDateTime(leave.approvedAt) : "Pending Review"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {leave.approvedAt 
                        ? "The department manager has officially approved this leave request."
                        : "Waiting for the manager to review the reasons and schedule."}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default ViewLeave;