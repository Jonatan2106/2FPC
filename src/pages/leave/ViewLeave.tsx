import React from 'react';
import Navbar from '../../common/Navbar';

const ViewLeave: React.FC = () => {
  const createdAt = 'March 5, 2026 09:14 AM';
  const approvedAt = 'March 8, 2026 02:30 PM';

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
      <Navbar/>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{
            marginBottom: 24,
            padding: '28px 32px',
            backgroundColor: '#ffffff',
            borderRadius: 24,
            border: '1px solid #e5e7eb',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1 }}>
              Leave Request Overview
            </div>
            <div style={{ marginTop: 8, color: '#6b7280', fontSize: 16 }}>
              View when this leave request was created and when it was approved.
            </div>
          </div>

          <div style={{ display: 'grid', gap: 18 }}>
            <section
              style={{
                padding: 24,
                borderRadius: 20,
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569', fontWeight: 700 }}>
                    Request Created
                  </div>
                </div>
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Completed
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
                {createdAt}
              </div>
              <div style={{ color: '#64748b', fontSize: 15 }}>
                This is the date and time when the leave request was submitted.
              </div>
            </section>

            <section
              style={{
                padding: 24,
                borderRadius: 20,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569', fontWeight: 700 }}>
                    Request Approved
                  </div>
                </div>
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Approved
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
                {approvedAt}
              </div>
              <div style={{ color: '#64748b', fontSize: 15 }}>
                This is the date and time when the leave request received final approval.
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLeave;
