import React, { useState, useRef, useCallback } from 'react';
import Avatar from './Avatar';
import { TagChip, CIBadge } from './Chips';
import { useApp } from '../context/AppContext';

const DOUBLE_TAP_DELAY = 300;

const SoundWave = ({ isActive }) => (
  <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '16px' }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{
        width: '3px',
        backgroundColor: 'var(--accent)',
        borderRadius: '2px',
        height: isActive ? undefined : '3px',
        animation: isActive ? `wave-bar-${i} ${0.5 + i * 0.15}s ease-in-out infinite alternate` : 'none',
        minHeight: '3px',
      }} />
    ))}
  </div>
);

const LongPressMenu = ({ onClose, onAmplify, onSave, onFlag, onTranslate }) => (
  <>
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' }} />
    <div style={{
      position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 301, display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center',
      animation: 'radial-pop 200ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
    }}>
      {[
        { icon: '↗', label: 'Amplify', action: onAmplify, color: 'var(--status-verified)' },
        { icon: '🔖', label: 'Save', action: onSave, color: 'var(--text-2)' },
        { icon: '🌐', label: 'Translate', action: onTranslate, color: 'var(--accent)' },
        { icon: '⚑', label: 'Flag', action: onFlag, color: 'var(--status-pending)' },
        { icon: '✕', label: 'Cancel', action: onClose, color: 'var(--text-3)' },
      ].map(item => (
        <div key={item.label} onClick={() => { item.action?.(); onClose(); }}
          style={{
            width: '72px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            cursor: 'pointer',
          }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--surface-raised)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
            border: '1px solid var(--divider)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            {item.icon}
          </div>
          <span style={{ fontFamily: 'Outfit', fontSize: '11px', color: item.color }}>{item.label}</span>
        </div>
      ))}
    </div>
  </>
);

const HeartAnimation = ({ show }) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10, pointerEvents: 'none',
      animation: 'heart-burst 600ms ease forwards',
      fontSize: '48px',
    }}>
      ★
    </div>
  );
};

const FeedCard = ({ post, index = 0, onOpenPost }) => {
  const { toggleMark, toggleAmplify } = useApp();
  const [showHeart, setShowHeart] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastTapRef = useRef(null);
  const longPressRef = useRef(null);
  const pointerStartX = useRef(null);
  const cardRef = useRef();

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      setShowHeart(true);
      toggleMark(post.id);
      setTimeout(() => setShowHeart(false), 700);
      lastTapRef.current = null;
    } else {
      lastTapRef.current = now;
    }
  }, [post.id, toggleMark]);

  const handlePointerDown = useCallback((e) => {
    pointerStartX.current = e.clientX;
    longPressRef.current = setTimeout(() => {
      setShowMenu(true);
    }, 400);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (pointerStartX.current === null) return;
    const diff = e.clientX - pointerStartX.current;
    if (diff > 10) {
      clearTimeout(longPressRef.current);
      setIsDragging(true);
      setSwipeX(Math.min(diff, 120));
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    clearTimeout(longPressRef.current);
    if (swipeX > 80) {
      toggleAmplify(post.id);
    }
    setSwipeX(0);
    setIsDragging(false);
    pointerStartX.current = null;
  }, [swipeX, post.id, toggleAmplify]);

  const statusColors = { live: 'var(--status-live)', pending: 'var(--status-pending)', verified: 'var(--status-verified)', info: 'var(--status-info)' };

  return (
    <>
      {showMenu && (
        <LongPressMenu
          onClose={() => setShowMenu(false)}
          onAmplify={() => toggleAmplify(post.id)}
          onSave={() => {}}
          onFlag={() => {}}
          onTranslate={() => {}}
        />
      )}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        {/* Amplify indicator behind card */}
        {isDragging && (
          <div style={{
            position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
            opacity: Math.min(swipeX / 80, 1), color: 'var(--status-verified)', fontSize: '20px',
            transition: 'opacity 100ms',
          }}>
            ↗
          </div>
        )}
        <div
          ref={cardRef}
          className="card-shadow"
          onClick={handleDoubleTap}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            backgroundColor: post.isNew ? 'var(--surface)' : 'var(--surface)',
            borderRadius: '16px',
            padding: '16px',
            position: 'relative',
            transform: `translateX(${swipeX}px)`,
            transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            animation: post.isNew ? 'new-post-drop 360ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : `card-enter 280ms ${index * 60}ms ease both`,
            userSelect: 'none',
            touchAction: 'pan-y',
            cursor: 'default',
          }}
        >
          <HeartAnimation show={showHeart} />

          {/* Header */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <Avatar size={40} ciScore={post.author.ci_score} initials={post.author.initials} isSectorAnalyst={post.author.is_sector_analyst} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 500, fontSize: '15px', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.author.name}
                </span>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', flexShrink: 0 }}>{post.time}</span>
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '13px', color: 'var(--text-2)' }}>{post.author.handle}</div>
            </div>
          </div>

          {/* Body */}
          <div style={{
            fontFamily: 'Outfit', fontSize: '15px', color: 'var(--text-1)', lineHeight: 1.5,
            marginBottom: '12px',
            display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {post.body}
          </div>

          {post.image && (
            <div style={{ marginBottom: '12px', borderRadius: '12px', overflow: 'hidden', maxHeight: '200px' }}>
              <img src={post.image} alt="" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: 'var(--divider)', margin: '0 -16px 12px' }} />

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', minWidth: 0 }}>
              <TagChip label={post.tag.label} status={post.tag.status} />
              <CIBadge score={post.author.ci_score} />
            </div>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-3)', flexShrink: 0 }}>
              {/* Mark */}
              <button onClick={(e) => { e.stopPropagation(); toggleMark(post.id); }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: post.is_marked ? 'var(--status-verified)' : 'var(--text-3)', transition: 'color 120ms', padding: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={post.is_marked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 120ms', transform: post.is_marked ? 'scale(1.2)' : 'scale(1)' }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px' }}>{post.mark_count}</span>
              </button>
              {/* Reply */}
              <button onClick={(e) => { e.stopPropagation(); onOpenPost && onOpenPost(post); }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px' }}>{post.reply_count}</span>
              </button>
              {/* Amplify */}
              <button onClick={(e) => { e.stopPropagation(); toggleAmplify(post.id); }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: post.is_amplified ? 'var(--status-verified)' : 'var(--text-3)', transition: 'color 120ms', padding: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px' }}>{post.amplify_count}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedCard;
