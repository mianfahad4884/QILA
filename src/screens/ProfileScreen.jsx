import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Avatar from '../components/Avatar';
import * as api from '../lib/api';

const CI_TIERS = [
  { name: 'Observer', min: 0, max: 99 },
  { name: 'Analyst', min: 100, max: 499 },
  { name: 'Senior Analyst', min: 500, max: 999 },
  { name: 'Verified Operator', min: 1000, max: 2499 },
  { name: 'Sector Analyst', min: 2500, max: Infinity },
];

function computeTier(score) {
  return CI_TIERS.find(t => score >= t.min && score <= t.max)?.name || 'Observer';
}

export default function ProfileScreen() {
  const { currentUser, session } = useApp();
  const [activeTab, setActiveTab] = useState('Posts');
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const tierName = computeTier(currentUser.ci_score);
  const nextTier = CI_TIERS[CI_TIERS.findIndex(t => t.name === tierName) + 1];
  const tierProgress = nextTier
    ? ((currentUser.ci_score - CI_TIERS.find(t => t.name === tierName).min) / (nextTier.min - CI_TIERS.find(t => t.name === tierName).min)) * 100
    : 100;

  useEffect(() => {
    async function loadUserPosts() {
      if (!currentUser?.id || !session) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${currentUser.id}/posts?type=${activeTab === 'Analysis' ? 'sector' : 'wire'}`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const data = await response.json();
        setUserPosts(data.posts || []);
      } catch (err) {
        console.error('Failed to load user posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUserPosts();
  }, [currentUser.id, session, activeTab]);

  const stats = currentUser.stats || { wire_count: 0, sector_count: 0, total_amplified: 0, total_marked: 0 };
  const totalPosts = (stats.wire_count || 0) + (stats.sector_count || 0);

  const formatStats = (val) => {
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val;
  };

  const statusColors = { live: 'var(--status-live)', pending: 'var(--status-pending)', verified: 'var(--status-verified)', info: 'var(--status-info)' };

  return (
    <div>
      <div style={{ padding: '32px 24px 0', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <Avatar size={72} ciScore={currentUser.ci_score} initials={currentUser.initials} isSectorAnalyst={currentUser.is_sector_analyst} />
        </div>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: '22px', fontWeight: 500, color: 'var(--text-1)', marginBottom: '4px' }}>
          {currentUser.display_name}
        </h2>
        <p style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-2)', marginBottom: '16px' }}>
          @{currentUser.handle} · {currentUser.primary_sector}
        </p>
        <p style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-1)', maxWidth: '320px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          "{currentUser.field_note || 'Establishing field presence...'}"
        </p>

        {/* Stats Row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '32px' }}>
          {[
            { value: totalPosts, label: 'Posts' },
            { value: formatStats(stats.total_amplified), label: 'Amplified' },
            { value: formatStats(stats.total_marked), label: 'Cited' },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display', fontSize: '22px', fontWeight: 600, color: 'var(--text-1)' }}>{value}</div>
              <div style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--text-2)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* CI Progress */}
        <div style={{ textAlign: 'left', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-2)' }}>CI Score</span>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '13px', color: 'var(--text-1)' }}>{currentUser.ci_score.toLocaleString()} pts</span>
          </div>
          <div style={{ height: '4px', backgroundColor: 'var(--surface-raised)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${tierProgress}%`,
              backgroundColor: 'var(--accent)',
              borderRadius: '2px',
              transition: 'width 600ms ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--text-3)' }}>{tierName}</span>
            {nextTier && (
              <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)' }}>
                {(nextTier.min - currentUser.ci_score).toLocaleString()} pts to {nextTier.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--divider)' }}>
        {['Posts', 'Analysis', 'Saved'].map(tab => (
          <div key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, textAlign: 'center', padding: '14px 0', cursor: 'pointer',
            fontFamily: 'Outfit', fontSize: '14px',
            color: activeTab === tab ? 'var(--text-1)' : 'var(--text-3)',
            fontWeight: activeTab === tab ? 500 : 400,
            borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
            transition: 'all 200ms ease',
          }}>
            {tab}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ width: '24px', height: '24px', border: '2px solid var(--divider)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'live-pulse 1s infinite linear', margin: '0 auto' }} />
          </div>
        ) : userPosts.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', fontFamily: 'Outfit', fontSize: '14px', paddingTop: '40px' }}>
            No {activeTab.toLowerCase()} found.
          </div>
        ) : (
          <div>
            {userPosts.map(post => (
              <div key={post.id} className="card-shadow" style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-1)', lineHeight: 1.5, marginBottom: '12px' }}>
                  {post.body}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 8px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '100px', gap: '5px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: statusColors[post.signal_type] || 'var(--status-info)' }} />
                    <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-2)' }}>{(post.signal_type || 'POST').toUpperCase()}</span>
                  </div>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)' }}>
                    {new Date(post.created_at).toLocaleDateString()} · ★ {post.mark_count || 0} · 💬 {post.reply_count || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
