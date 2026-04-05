import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Avatar from '../components/Avatar';

const TOP_ANALYSTS = [
  { id: 'u2', name: 'IndoPacWatch', initials: 'IP', ci_score: 3412, sector: 'Indo-Pacific' },
  { id: 'u1', name: 'StrategyDesk_A', initials: 'SD', ci_score: 1240, sector: 'Eastern Europe' },
  { id: 'u7', name: 'CyberSentinel_7', initials: 'CS', ci_score: 890, sector: 'Cyber' },
  { id: 'u5', name: 'NuclearWatch_EU', initials: 'NW', ci_score: 672, sector: 'Nuclear Watch' },
];

const FEATURED_POSTS = [
  { id: 'f1', sector: 'Indo-Pacific', title: 'Maritime Posture Shift in the South China Sea: A 90-Day Analysis', author: 'IndoPacWatch', time: '2h', ci: 3412 },
  { id: 'f2', sector: 'Cyber', title: 'OT/ICS Targeting Methodology: A Technical Assessment of Recent Campaigns', author: 'CyberSentinel_7', time: '6h', ci: 890 },
  { id: 'f3', sector: 'Nuclear Watch', title: 'Non-Proliferation Treaty Compliance: The Three Outliers', author: 'NuclearWatch_EU', time: '1d', ci: 672 },
];

export default function DiscoverScreen() {
  const { sectors, toggleFollowSector, crisisMode } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults(null); return; }
    // Mock search
    const results = sectors.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
    setSearchResults({ sectors: results, users: TOP_ANALYSTS.filter(a => a.name.toLowerCase().includes(q.toLowerCase())) });
  };

  return (
    <div style={{ padding: '0 24px 40px' }}>
      {/* Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--surface-raised)', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search sectors, users, reports..."
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-1)', fontFamily: 'Outfit', fontSize: '15px' }}
        />
        {searchQuery && <button onClick={() => handleSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>✕</button>}
      </div>

      {/* Search Results */}
      {searchResults && (
        <div style={{ marginBottom: '32px' }}>
          {searchResults.sectors.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', marginBottom: '12px', letterSpacing: '0.5px' }}>SECTORS</div>
              {searchResults.sectors.map(s => (
                <div key={s.slug} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--divider)' }}>
                  <div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 500, fontSize: '15px', color: 'var(--text-1)' }}>{s.name}</div>
                    <div style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--text-3)' }}>{s.analysts} analysts</div>
                  </div>
                  <div style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-2)', cursor: 'pointer' }}>{s.is_following ? '✓ Following' : 'Follow'}</div>
                </div>
              ))}
            </div>
          )}
          {searchResults.users.length > 0 && (
            <div>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', marginBottom: '12px', letterSpacing: '0.5px' }}>ANALYSTS</div>
              {searchResults.users.map(u => (
                <div key={u.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--divider)' }}>
                  <Avatar size={40} ciScore={u.ci_score} initials={u.initials} />
                  <div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 500, fontSize: '15px', color: 'var(--text-1)' }}>{u.name}</div>
                    <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)' }}>CI:{u.ci_score} · {u.sector}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {searchResults.sectors.length === 0 && searchResults.users.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', fontFamily: 'Outfit', fontSize: '14px', padding: '32px 0' }}>
              No results. Try a broader search.
            </div>
          )}
        </div>
      )}

      {!searchResults && (
        <>
          {/* Crisis Banner */}
          {crisisMode && (
            <div style={{ backgroundColor: 'rgba(255,69,58,0.08)', borderLeft: '3px solid var(--status-live)', padding: '16px', borderRadius: '0 8px 8px 0', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-live)', animation: 'live-pulse 2s infinite' }} />
                <h4 style={{ fontFamily: 'IBM Plex Mono', fontSize: '13px', color: 'var(--text-1)', fontWeight: 600 }}>RED SEA CRISIS — LIVE</h4>
              </div>
              <p style={{ fontFamily: 'Outfit', fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px' }}>247 analysts active · Crisis stream open</p>
              <div style={{ fontFamily: 'Outfit', fontSize: '13px', fontWeight: 500, color: 'var(--text-1)' }}>Enter Crisis Stream →</div>
            </div>
          )}

          {/* Active Now — Trending Tags */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', marginBottom: '16px', letterSpacing: '0.5px' }}>ACTIVE NOW</h3>
            <div className="no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px', margin: '0 -24px', padding: '0 24px 4px' }}>
              {['#StraitOfHormuz', '#PLANavy', '#NATO', '#SupplyChain', '#KievFront', '#Cyber'].map(tag => (
                <div key={tag} style={{ padding: '8px 16px', backgroundColor: 'var(--surface)', borderRadius: '100px', color: 'var(--text-1)', fontSize: '14px', fontFamily: 'Outfit', whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0 }}>
                  {tag}
                </div>
              ))}
            </div>
          </div>

          {/* Notable Analysts */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', marginBottom: '16px', letterSpacing: '0.5px' }}>NOTABLE ANALYSTS</h3>
            <div className="no-scrollbar" style={{ display: 'flex', gap: '16px', overflowX: 'auto', margin: '0 -24px', padding: '0 24px 4px' }}>
              {TOP_ANALYSTS.map(analyst => (
                <div key={analyst.id} className="card-shadow" style={{ width: '140px', flexShrink: 0, backgroundColor: 'var(--surface)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }}>
                  <Avatar size={48} ciScore={analyst.ci_score} initials={analyst.initials} />
                  <div style={{ fontFamily: 'Outfit', fontSize: '13px', fontWeight: 500, color: 'var(--text-1)', marginTop: '12px', marginBottom: '4px' }}>{analyst.name}</div>
                  <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-3)' }}>CI {analyst.ci_score}</div>
                  <div style={{ fontFamily: 'Outfit', fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{analyst.sector}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Analysis */}
          <div>
            <h3 style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', marginBottom: '16px', letterSpacing: '0.5px' }}>FEATURED ANALYSIS</h3>
            {FEATURED_POSTS.map(post => (
              <div key={post.id} className="card-shadow" style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', padding: '16px', marginBottom: '16px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'Outfit', fontSize: '11px', color: 'var(--text-3)', backgroundColor: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '100px' }}>{post.sector}</span>
                </div>
                <h4 style={{ fontFamily: 'Playfair Display', fontSize: '17px', color: 'var(--text-1)', lineHeight: 1.3, marginBottom: '12px' }}>{post.title}</h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)' }}>
                  <span>{post.author}</span>
                  <span>·</span>
                  <span>CI:{post.ci}</span>
                  <span>·</span>
                  <span>{post.time}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
