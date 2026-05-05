import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Alert, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { LeaveManagements } from '../../types/leave_management';

const ViewLeave: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Mengambil ID dari URL aplikasi (React Router)
  const navigate = useNavigate();
  
  const [leave, setLeave] = useState<LeaveManagements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = "http://localhost:8080/api/web";

  useEffect(() => {
    const fetchLeaveTimeline = async () => {
      try {
        setLoading(true);
        // Menggunakan URL yang benar sesuai permintaan Anda
        // Kita kirimkan ID melalui Query Parameter agar backend tahu data mana yang diambil
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
        // Menyesuaikan dengan struktur data yang biasanya dikirim controller (result.data atau result)
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f7f7f8',
        padding: '32px',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#111827',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          style={{ marginBottom: 20, color: '#6366f1', fontWeight: 600, textTransform: 'none' }}
        >
          Back to Leave List
        </Button>

        {error && (
          <Alert severity="error" style={{ marginBottom: 20, borderRadius: 12 }}>
            {error}
          </Alert>
        )}

        {leave && (
          <div
            style={{
              padding: '40px',
              backgroundColor: '#ffffff',
              borderRadius: 24,
              border: '1px solid #e5e7eb',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Leave Timeline
              </div>
              <div style={{ marginTop: 12, color: '#6b7280', fontSize: 16 }}>
                Tracking details for Request <strong>#{id?.slice(-6).toUpperCase()}</strong>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              {/* Vertical Connector Line */}
              <div style={{
                position: 'absolute',
                left: '31px',
                top: '40px',
                bottom: '40px',
                width: '2px',
                backgroundColor: '#e5e7eb',
                zIndex: 0
              }} />

              {/* Step 1: Creation */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 40, position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20, backgroundColor: '#eff6ff', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '4px solid #ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontSize: '24px'
                }}>
                  📝
                </div>
                <div style={{ flex: 1, padding: '24px', borderRadius: 20, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', fontWeight: 800 }}>
                      Submission
                    </span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                    {formatDateTime(leave.createdAt)}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 14 }}>
                    Request successfully created by User ID: {leave.user_id}
                  </div>
                </div>
              </div>

              {/* Step 2: Approval */}
              <div style={{ display: 'flex', gap: 24, position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20, 
                  backgroundColor: leave.approvedAt ? '#dcfce7' : '#fff7ed', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '4px solid #ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontSize: '24px'
                }}>
                  {leave.approvedAt ? '✅' : '⏳'}
                </div>
                <div style={{ 
                  flex: 1, padding: '24px', borderRadius: 20, 
                  backgroundColor: '#ffffff', 
                  border: leave.approvedAt ? '2px solid #22c55e' : '1px solid #e5e7eb' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', fontWeight: 800 }}>
                      Manager Approval
                    </span>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: 999, 
                      backgroundColor: leave.approvedAt ? '#dcfce7' : '#fef3c7', 
                      color: leave.approvedAt ? '#15803d' : '#92400e', 
                      fontSize: 11, fontWeight: 800 
                    }}>
                      {leave.approvedAt ? 'COMPLETED' : 'PENDING'}
                    </span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                    {leave.approvedAt ? formatDateTime(leave.approvedAt) : "Pending Review"}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 14 }}>
                    {leave.approvedAt 
                      ? "The department manager has officially approved this leave request."
                      : "Waiting for the manager to review the reasons and schedule."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewLeave;