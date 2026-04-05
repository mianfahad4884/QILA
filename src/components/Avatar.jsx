import React from 'react';

// CI Tiers:
// Observer (0–99): no ring / invisible
// Analyst (100–499): thin white ring rgba(255,255,255,0.2)
// Senior (500–999): solid ring var(--accent)
// Verified (1000+): var(--status-verified) double ring
// Sector Analyst: soft gold #C9A84C

const Avatar = ({ size = 40, ciScore = 0, isSectorAnalyst = false, initials = 'U', isSpeaking = false }) => {
  let ringStyle = {};
  let isVerified = ciScore >= 1000;

  if (isSectorAnalyst) {
    ringStyle = { border: '2px solid #C9A84C' };
  } else if (ciScore >= 1000) {
    if (isSpeaking) {
      ringStyle = { 
        border: '2px solid var(--status-verified)',
        animation: 'action-pop 800ms infinite ease-in-out' // simulate pulsing
      };
    } else {
      ringStyle = { border: '2px solid var(--status-verified)', padding: '2px' };
    }
  } else if (ciScore >= 500) {
    ringStyle = { border: '1.5px solid var(--accent)' };
  } else if (ciScore >= 100) {
    ringStyle = { border: '1.5px solid rgba(255,255,255,0.2)' };
  } else {
    // Observer
    ringStyle = { border: '2px solid transparent' };
  }

  // Handle muted vs speaking in bunker
  if (isSpeaking) {
    ringStyle.border = '2px solid var(--status-verified)';
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: '#2A2A2E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 500,
        fontSize: size * 0.4,
        ...ringStyle,
        boxSizing: 'border-box'
      }}>
        {initials}
      </div>
      {isVerified && !isSectorAnalyst && (
        <div style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          width: 14,
          height: 14,
          backgroundColor: 'var(--bg)', // to cut out the avatar
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: 10,
            height: 10,
            backgroundColor: 'var(--status-verified)',
            borderRadius: '2px', // fake shield shape roughly
            clipPath: 'polygon(50% 100%, 100% 80%, 100% 0, 0 0, 0 80%)'
          }} />
        </div>
      )}
    </div>
  );
};

export default Avatar;
