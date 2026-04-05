import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Avatar from '../components/Avatar';
import FeedCard from '../components/FeedCard';
import PostDetailSheet from '../components/PostDetailSheet';

const FilterPills = ({ active, setActive }) => {
  const filters = ['All', 'Breaking', 'SITREP', 'Confirmed', 'OSINT', 'Analysis'];
  return (
    <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 24px 16px', WebkitOverflowScrolling: 'touch' }}>
      {filters.map(f => (
        <div key={f} onClick={() => setActive(f)} style={{
          padding: '6px 14px', borderRadius: '100px', cursor: 'pointer', whiteSpace: 'nowrap',
          backgroundColor: active === f ? 'var(--accent-soft)' : 'transparent',
          border: `1px solid ${active === f ? 'transparent' : 'var(--divider)'}`,
          color: active === f ? 'var(--text-1)' : 'var(--text-3)',
          fontFamily: 'Outfit', fontSize: '13px', fontWeight: 500, transition: 'all 200ms ease'
        }}>{f}</div>
      ))}
    </div>
  );
};

const NewPostToast = ({ count, onTap }) => {
  if (count === 0) return null;
  return (
    <div onClick={onTap} style={{
      position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)',
      backgroundColor: 'var(--surface-raised)', borderRadius: '100px',
      padding: '8px 16px', zIndex: 50, cursor: 'pointer',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      animation: 'new-post-drop 320ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      border: '1px solid var(--divider)'
    }}>
      <span style={{ fontFamily: 'Outfit', fontSize: '13px', fontWeight: 500, color: 'var(--text-1)' }}>
        ↑ {count} new dispatch{count !== 1 ? 'es' : ''}
      </span>
    </div>
  );
};

export default function WireScreen() {
  const { posts, crisisMode, newToastCount, setNewToastCount } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');
  const [openPost, setOpenPost] = useState(null);

  const filtered = posts.filter(p => {
    if (activeFilter === 'All') return true;
    return p.signal_type === activeFilter.toLowerCase();
  });

  return (
    <div style={{ paddingBottom: '20px' }}>
      {openPost && <PostDetailSheet post={openPost} onClose={() => setOpenPost(null)} />}
      <NewPostToast count={newToastCount} onTap={() => setNewToastCount(0)} />

      <FilterPills active={activeFilter} setActive={setActiveFilter} />

      {/* Crisis Banner */}
      {crisisMode && (
        <div style={{ margin: '0 24px 20px', backgroundColor: 'rgba(255,69,58,0.08)', borderLeft: '3px solid var(--status-live)', padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-live)', animation: 'live-pulse 2s infinite' }} />
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-1)', fontWeight: 600 }}>RED SEA CRISIS — LIVE</span>
          </div>
          <p style={{ fontFamily: 'Outfit', fontSize: '13px', color: 'var(--text-2)' }}>247 analysts active · Crisis stream open</p>
        </div>
      )}

      <div style={{ padding: '0 24px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '64px 0', fontFamily: 'Outfit', fontSize: '14px' }}>
            No new dispatches. The wire is quiet.
          </div>
        ) : (
          filtered.map((post, i) => (
            <FeedCard key={post.id} post={post} index={i} onOpenPost={setOpenPost} />
          ))
        )}
        {filtered.length > 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '24px 0 40px', fontFamily: 'Outfit', fontSize: '14px' }}>
            You're caught up. Check back later.
          </div>
        )}
      </div>
    </div>
  );
}
