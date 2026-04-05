import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Avatar from './Avatar';

export default function PostDetailSheet({ post, onClose }) {
  const { addReply, currentUser } = useApp();
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    if (!replyText.trim()) return;
    addReply(post.id, replyText.trim());
    setReplyText('');
  };

  const statusColors = { live: 'var(--status-live)', pending: 'var(--status-pending)', verified: 'var(--status-verified)', info: 'var(--status-info)' };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, top: '60px',
        backgroundColor: 'var(--bg)', borderRadius: '20px 20px 0 0', zIndex: 201,
        overflowY: 'auto', animation: 'sheet-up 320ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header with back */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 20px 0', gap: '12px', borderBottom: '1px solid var(--divider)', paddingBottom: '16px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ fontFamily: 'Outfit', fontSize: '16px', color: 'var(--text-2)' }}>Dispatch</span>
        </div>

        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {/* Original post */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <Avatar size={44} ciScore={post.author.ci_score} initials={post.author.initials} />
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '15px', color: 'var(--text-1)' }}>{post.author.name}</div>
              <div style={{ fontFamily: 'Outfit', fontSize: '13px', color: 'var(--text-2)' }}>{post.author.handle}</div>
            </div>
          </div>
          <div style={{ fontFamily: 'Outfit', fontSize: '16px', color: 'var(--text-1)', lineHeight: 1.6, marginBottom: '16px' }}>{post.body}</div>
          {post.image && <img src={post.image} alt="" style={{ width: '100%', borderRadius: '12px', marginBottom: '16px' }} />}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '100px', gap: '6px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: statusColors[post.tag.status] }} />
              <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-2)' }}>{post.tag.label}</span>
            </div>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: 'var(--text-3)' }}>{post.time}</span>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '20px', padding: '16px 0', borderTop: '1px solid var(--divider)', borderBottom: '1px solid var(--divider)', marginBottom: '20px' }}>
            <div style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{post.mark_count}</span> Marks
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{post.amplify_count}</span> Amplified
            </div>
          </div>

          {/* Replies */}
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', marginBottom: '16px', letterSpacing: '0.5px' }}>REPLIES</div>
          {(post.replies || []).map(reply => (
            <div key={reply.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <Avatar size={36} ciScore={reply.author.ci_score} initials={reply.author.initials} />
              <div style={{ flex: 1, backgroundColor: 'var(--surface)', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontFamily: 'Outfit', fontWeight: 500, fontSize: '14px', color: 'var(--text-1)', marginBottom: '4px' }}>{reply.author.name}</div>
                <div style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-1)', lineHeight: 1.5 }}>{reply.body}</div>
                <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', marginTop: '8px' }}>{reply.time}</div>
              </div>
            </div>
          ))}
          {post.replies?.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', fontFamily: 'Outfit', fontSize: '14px', padding: '20px 0' }}>
              No replies yet. Be the first.
            </div>
          )}
        </div>

        {/* Reply Compose */}
        <div style={{ display: 'flex', gap: '10px', padding: '12px 16px 32px', borderTop: '1px solid var(--divider)', alignItems: 'center' }}>
          <Avatar size={32} ciScore={currentUser.ci_score} initials={currentUser.initials} />
          <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleReply(); }}
            placeholder="Write a reply..."
            style={{ flex: 1, backgroundColor: 'var(--surface-raised)', border: '1px solid var(--divider)', borderRadius: '12px', padding: '10px 14px', color: 'var(--text-1)', fontFamily: 'Outfit', fontSize: '14px', outline: 'none' }}
          />
          <button onClick={handleReply} disabled={!replyText.trim()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: replyText.trim() ? 'var(--text-1)' : 'var(--text-3)', transition: 'color 160ms' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </>
  );
}
