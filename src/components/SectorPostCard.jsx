import React from 'react';
import Avatar from './Avatar';

const SectorPostCard = ({ post, onVote }) => {
  return (
    <div className="card-shadow" style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', padding: '16px', marginBottom: '20px', cursor: 'pointer' }}>
      {/* Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ padding: '2px 10px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '100px', color: 'var(--text-3)', fontFamily: 'Outfit', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {post.sector_name}
        </div>
        <div style={{ padding: '2px 10px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-2)', fontFamily: 'Outfit', fontSize: '11px' }}>
          <div style={{ width: '3px', height: '3px', backgroundColor: 'var(--status-info)' }} />
          {post.pov_type.replace('_', ' ')}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontFamily: 'Playfair Display', fontSize: '20px', fontWeight: 600, color: 'var(--text-1)',
            lineHeight: 1.25, marginBottom: '8px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {post.title}
          </h2>
          <p style={{
            fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-2)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            WebkitMaskImage: '-webkit-linear-gradient(top, black 60%, transparent 100%)',
          }}>
            {post.body?.slice(0, 160)}...
          </p>
        </div>
        {post.thumbnail && (
          <div style={{ width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={post.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--divider)', margin: '0 -16px 12px' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', minWidth: 0 }}>
          <Avatar size={24} ciScore={post.author.ci_score} initials={post.author.initials} />
          <span style={{ fontFamily: 'Outfit', fontSize: '13px', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.author.name}</span>
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)' }}>CI:{post.author.ci_score}</span>
          {post.read_time_mins && <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)' }}>· {post.read_time_mins}m read</span>}
        </div>
        {/* Vote */}
        {onVote && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
            <button onClick={(e) => { e.stopPropagation(); onVote(post.id, 1); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: post.user_vote === 1 ? 'var(--status-verified)' : 'var(--text-3)', fontSize: '16px', transition: 'color 120ms', padding: '0 4px' }}>
              ↑
            </button>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: 'var(--text-2)' }}>{post.upvote_count}</span>
            <button onClick={(e) => { e.stopPropagation(); onVote(post.id, -1); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: post.user_vote === -1 ? 'var(--status-live)' : 'var(--text-3)', fontSize: '16px', transition: 'color 120ms', padding: '0 4px' }}>
              ↓
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectorPostCard;
