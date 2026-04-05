import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import Avatar from './Avatar';

const SIGNAL_TYPES = [
  { key: 'breaking', label: 'BREAKING', status: 'live', description: 'Unverified, time-sensitive' },
  { key: 'sitrep', label: 'SITREP', status: 'pending', description: 'Situation report' },
  { key: 'confirmed', label: 'CONFIRMED', status: 'verified', description: 'Independently verified' },
  { key: 'osint', label: 'OSINT', status: 'info', description: 'Open-source intelligence' },
  { key: 'analysis', label: 'ANALYSIS', status: 'info', description: 'Your assessment' },
];

const STATUS_COLORS = {
  live: 'var(--status-live)',
  pending: 'var(--status-pending)',
  verified: 'var(--status-verified)',
  info: 'var(--status-info)',
};

export default function ComposeSheet({ onClose }) {
  const { currentUser, addPost } = useApp();
  const [body, setBody] = useState('');
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const MAX_CHARS = 1000;
  const canPost = body.trim().length > 0 && selectedSignal;

  const handlePost = async () => {
    if (!canPost) return;
    setIsPosting(true);
    await new Promise(r => setTimeout(r, 300));
    const sig = SIGNAL_TYPES.find(s => s.key === selectedSignal);
    addPost({
      body: body.trim(),
      signal_type: selectedSignal,
      tag: { label: sig.label, status: sig.status }
    });
    setIsPosting(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)', zIndex: 200,
      }} />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: 'var(--surface)',
        borderRadius: '20px 20px 0 0',
        zIndex: 201,
        maxHeight: '90vh',
        animation: 'sheet-up 320ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px' }}>
          <div style={{ fontFamily: 'Outlet', fontSize: '16px', fontWeight: 500, color: 'var(--text-2)' }}>Compose</div>
          <button onClick={handlePost} disabled={!canPost || isPosting}
            style={{
              padding: '8px 20px', borderRadius: '10px', border: 'none',
              fontFamily: 'Outfit', fontSize: '15px', fontWeight: 600,
              backgroundColor: canPost ? 'var(--surface-raised)' : 'transparent',
              color: canPost ? 'var(--text-1)' : 'var(--text-3)',
              cursor: canPost ? 'pointer' : 'not-allowed',
              transition: 'all 200ms ease',
            }}>
            {isPosting ? '...' : 'Post'}
          </button>
        </div>

        {/* Compose area */}
        <div style={{ display: 'flex', gap: '12px', padding: '0 20px 16px' }}>
          <Avatar size={40} ciScore={currentUser.ci_score} initials={currentUser.initials} />
          <textarea
            autoFocus
            value={body}
            onChange={e => setBody(e.target.value.slice(0, MAX_CHARS))}
            placeholder="What's happening?"
            style={{
              flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-1)', fontFamily: 'Outfit', fontSize: '16px',
              resize: 'none', minHeight: '120px', lineHeight: 1.5,
            }}
          />
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'var(--divider)', margin: '0 20px' }} />

        {/* Signal type selector */}
        <div style={{ padding: '16px 20px 8px' }}>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-3)', marginBottom: '10px', letterSpacing: '0.5px' }}>
            SIGNAL TYPE — REQUIRED
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {SIGNAL_TYPES.map((sig, i) => (
              <div key={sig.key}
                onClick={() => setSelectedSignal(selectedSignal === sig.key ? null : sig.key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '100px', cursor: 'pointer',
                  backgroundColor: selectedSignal === sig.key ? 'var(--accent-soft)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selectedSignal === sig.key ? 'var(--accent)' : 'transparent'}`,
                  transition: 'all 180ms ease',
                  animation: `card-enter 180ms ${i * 40}ms ease both`,
                }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: STATUS_COLORS[sig.status] }} />
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: selectedSignal === sig.key ? 'var(--text-1)' : 'var(--text-2)' }}>
                  {sig.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 32px' }}>
          <div style={{ display: 'flex', gap: '20px', color: 'var(--text-3)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </div>
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: body.length > MAX_CHARS * 0.9 ? 'var(--status-pending)' : 'var(--text-3)' }}>
            {MAX_CHARS - body.length}
          </span>
        </div>
      </div>
    </>
  );
}
