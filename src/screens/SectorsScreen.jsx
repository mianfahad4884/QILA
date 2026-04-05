import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Avatar from '../components/Avatar';
import SectorPostCard from '../components/SectorPostCard';

const SECTOR_PINNED_READS = [
  { id: 'pr1', title: 'Carrier Strike Group Delta at Sea', time: '2h ago' },
  { id: 'pr2', title: 'AIS Anomalies: 72-Hour Analysis', time: '1d ago' },
  { id: 'pr3', title: 'New Forward Basing Agreements Signed', time: '3d ago' },
];

export default function SectorsScreen() {
  const { sectors, sectorPosts, voteSectorPost, toggleFollowSector } = useApp();
  const [activeTab, setActiveTab] = useState('Hot');
  const [selectedSector, setSelectedSector] = useState(null);

  const followed = sectors.filter(s => s.is_following);
  const all = sectors;

  if (selectedSector) {
    const sector = sectors.find(s => s.slug === selectedSector);
    const posts = sectorPosts.filter(p => p.sector_id === selectedSector || true); // show all in demo
    return (
      <div>
        {/* Header */}
        <div style={{ padding: '24px 24px 0' }}>
          <button onClick={() => setSelectedSector(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Outfit', fontSize: '15px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            All Sectors
          </button>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: '34px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px' }}>{sector?.name}</h1>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: 'var(--text-3)', marginBottom: '16px' }}>
            {sector?.analysts} analysts · {sector?.weekly_posts} posts this week
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button onClick={() => toggleFollowSector(selectedSector)}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', border: '1px solid var(--divider)', backgroundColor: sector?.is_following ? 'var(--accent-soft)' : 'var(--surface-raised)', color: sector?.is_following ? 'var(--accent)' : 'var(--text-1)', fontFamily: 'Outfit', fontSize: '14px', fontWeight: 500 }}>
              {sector?.is_following ? '✓ Following' : 'Follow'}
            </button>
            <button style={{ width: '44px', height: '44px', borderRadius: '10px', border: '1px solid var(--divider)', backgroundColor: 'var(--surface-raised)', cursor: 'pointer', color: 'var(--text-2)', fontSize: '18px' }}>🔔</button>
          </div>
        </div>

        {/* Pinned Reads */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', marginBottom: '12px', padding: '0 24px', letterSpacing: '0.5px' }}>PINNED READS</div>
          <div className="no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '0 24px 4px' }}>
            {SECTOR_PINNED_READS.map(read => (
              <div key={read.id} className="card-shadow" style={{ width: '160px', flexShrink: 0, backgroundColor: 'var(--surface)', borderRadius: '12px', padding: '14px', cursor: 'pointer', border: '1px solid var(--divider)' }}>
                <div style={{ fontFamily: 'Outfit', fontSize: '13px', color: 'var(--text-1)', lineHeight: 1.4, marginBottom: '8px' }}>{read.title}</div>
                <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-3)' }}>{read.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feed Tabs */}
        <div style={{ display: 'flex', gap: '8px', padding: '0 24px', marginBottom: '20px' }}>
          {['Hot', 'New', 'Top', 'Rising'].map(tab => (
            <div key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '6px 14px', borderRadius: '100px', cursor: 'pointer',
              backgroundColor: activeTab === tab ? 'var(--accent-soft)' : 'transparent',
              border: `1px solid ${activeTab === tab ? 'transparent' : 'var(--divider)'}`,
              color: activeTab === tab ? 'var(--text-1)' : 'var(--text-3)',
              fontFamily: 'Outfit', fontSize: '13px', fontWeight: 500,
            }}>{tab}</div>
          ))}
        </div>

        <div style={{ padding: '0 24px' }}>
          {posts.map(post => <SectorPostCard key={post.id} post={post} onVote={voteSectorPost} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Your Sectors */}
      <div style={{ padding: '0 0 32px 0' }}>
        <div style={{ padding: '0 24px', marginBottom: '16px' }}>
          <h3 style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', letterSpacing: '0.5px' }}>YOUR SECTORS</h3>
        </div>
        {followed.length === 0 ? (
          <div style={{ padding: '0 24px', color: 'var(--text-3)', fontFamily: 'Outfit', fontSize: '14px' }}>No sectors followed yet.</div>
        ) : (
          <div className="no-scrollbar" style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '0 24px 4px' }}>
            {followed.map(s => (
              <div key={s.slug} onClick={() => setSelectedSector(s.slug)} className="card-shadow" style={{
                width: '160px', height: '100px', flexShrink: 0, backgroundColor: 'var(--surface)',
                borderRadius: '16px', padding: '16px', cursor: 'pointer',
                border: '1px solid rgba(232,224,212,0.06)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                <div style={{ fontFamily: 'Playfair Display', fontSize: '16px', fontWeight: 600, color: 'var(--text-1)' }}>{s.name}</div>
                <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)' }}>{s.weekly_posts} posts/wk</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Sectors */}
      <div style={{ padding: '0 24px' }}>
        <h3 style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', marginBottom: '16px', letterSpacing: '0.5px' }}>ALL SECTORS</h3>
        {['regional', 'domain'].map(type => (
          <div key={type} style={{ marginBottom: '24px' }}>
            <div style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--text-3)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {type === 'regional' ? 'REGIONAL' : 'DOMAIN'}
            </div>
            {all.filter(s => s.type === type).map(s => (
              <div key={s.slug} onClick={() => setSelectedSector(s.slug)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 0', borderBottom: '1px solid var(--divider)', cursor: 'pointer',
                }}>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 500, fontSize: '16px', color: 'var(--text-1)' }}>{s.name}</div>
                  <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{s.analysts} analysts</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={(e) => { e.stopPropagation(); toggleFollowSector(s.slug); }}
                    style={{ padding: '5px 12px', borderRadius: '100px', cursor: 'pointer', border: `1px solid ${s.is_following ? 'transparent' : 'var(--divider)'}`, backgroundColor: s.is_following ? 'var(--accent-soft)' : 'transparent', color: s.is_following ? 'var(--text-1)' : 'var(--text-3)', fontFamily: 'Outfit', fontSize: '12px', transition: 'all 200ms' }}>
                    {s.is_following ? '✓' : '+'}
                  </button>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
