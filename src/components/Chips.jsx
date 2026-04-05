import React from 'react';

// status: 'live', 'verified', 'pending', 'info'
export const TagChip = ({ label, status }) => {
  const statusColors = {
    'live': 'var(--status-live)',
    'verified': 'var(--status-verified)',
    'pending': 'var(--status-pending)',
    'info': 'var(--status-info)'
  };

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      backgroundColor: 'rgba(255,255,255,0.06)',
      borderRadius: '100px',
      gap: '6px'
    }}>
      {status && (
        <div style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: statusColors[status] || 'var(--status-info)'
        }} />
      )}
      <span className="text-mono" style={{ color: 'var(--text-2)', fontSize: '11px', letterSpacing: '0.2px' }}>
        {label}
      </span>
    </div>
  );
};

export const CIBadge = ({ score }) => {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      borderRadius: '100px',
      color: 'var(--text-3)'
    }}>
      <span className="text-mono" style={{ fontSize: '11px' }}>
        CI {score.toLocaleString()}
      </span>
    </div>
  );
};
