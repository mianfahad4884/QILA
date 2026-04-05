import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Avatar from '../components/Avatar';

const NOTIF_ICONS = {
  amplify: '↗',
  reply: '💬',
  ci_gain: '↑',
  ci_loss: '↓',
  cited_by: '🔗',
  bunker_live: '🎙',
  mark: '★',
  mention: '@',
};

export default function NotificationsScreen({ onClose }) {
  const { notifications, markAllNotificationsRead } = useApp();
  const today = notifications.filter((_, i) => i < 3);
  const earlier = notifications.filter((_, i) => i >= 3);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '480px',
        backgroundColor: 'var(--bg)', zIndex: 201,
        animation: 'slide-in-right 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--divider)', backgroundColor: 'var(--surface)' }}>
          <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '18px', color: 'var(--text-1)' }}>Alerts</span>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span onClick={markAllNotificationsRead} style={{ fontFamily: 'Outfit', fontSize: '13px', color: 'var(--text-3)', cursor: 'pointer' }}>Mark all read</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>✕</button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {[{ label: 'TODAY', items: today }, { label: 'EARLIER', items: earlier }].map(group => (
            <div key={group.label} style={{ marginBottom: '24px' }}>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', marginBottom: '16px', letterSpacing: '0.5px' }}>{group.label}</div>
              {group.items.map(notif => (
                <div key={notif.id} style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  padding: '14px 0', borderBottom: '1px solid var(--divider)',
                  opacity: notif.is_read ? 0.5 : 1, transition: 'opacity 200ms',
                }}>
                  <div style={{ position: 'relative' }}>
                    {notif.actor ? <Avatar size={36} ciScore={notif.actor.ci_score} initials={notif.actor.initials} /> : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                        {NOTIF_ICONS[notif.type] || '•'}
                      </div>
                    )}
                    {!notif.is_read && (
                      <div style={{ position: 'absolute', top: -1, right: -1, width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-verified)', border: '1.5px solid var(--bg)' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-1)', lineHeight: 1.4 }}>
                      {notif.actor && <span style={{ fontWeight: 500 }}>{notif.actor.name} </span>}
                      {notif.body}
                    </div>
                    {notif.excerpt && (
                      <div style={{ fontFamily: 'Outfit', fontSize: '13px', color: 'var(--text-3)', marginTop: '4px', fontStyle: 'italic' }}>{notif.excerpt}</div>
                    )}
                    <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', marginTop: '6px' }}>{notif.time}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
