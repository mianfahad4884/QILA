import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Avatar from '../components/Avatar';
import ChatScreen from './ChatScreen';
import VoiceBunkerScreen from './VoiceBunkerScreen';

export default function OpsScreen() {
  const { channels, bunkers, setActiveChannel } = useApp();
  const [openChannel, setOpenChannel] = useState(null);
  const [openBunker, setOpenBunker] = useState(null);

  if (openChannel) return <ChatScreen channelId={openChannel} onBack={() => setOpenChannel(null)} />;
  if (openBunker) return <VoiceBunkerScreen bunkerId={openBunker} onBack={() => setOpenBunker(null)} />;

  return (
    <div>
      {/* Live Bunkers */}
      <div style={{ paddingBottom: '32px' }}>
        <div style={{ padding: '0 24px', marginBottom: '16px' }}>
          <h3 style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', letterSpacing: '0.5px' }}>LIVE BUNKERS</h3>
        </div>
        <div className="no-scrollbar" style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '0 24px', paddingBottom: '4px' }}>
          {bunkers.map(bunker => (
            <div key={bunker.id} onClick={() => setOpenBunker(bunker.id)}
              className="card-shadow" style={{
                width: '240px', flexShrink: 0, backgroundColor: 'var(--surface)',
                borderRadius: '16px', padding: '16px', cursor: 'pointer',
                transition: 'transform 150ms ease', position: 'relative', overflow: 'hidden'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(255,69,58,0.12)', padding: '3px 8px', borderRadius: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-live)', animation: 'live-pulse 2s infinite' }} />
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--status-live)' }}>LIVE</span>
                </div>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)' }}>{bunker.listener_count} listening</span>
              </div>
              <h4 style={{ fontFamily: 'Playfair Display', fontSize: '18px', color: 'var(--text-1)', marginBottom: '4px' }}>{bunker.title}</h4>
              <p style={{ fontFamily: 'Outfit', fontSize: '13px', color: 'var(--text-2)', marginBottom: '16px' }}>by {bunker.host.name}</p>
              <div style={{
                display: 'inline-flex', padding: '8px 14px', backgroundColor: 'var(--surface-raised)',
                borderRadius: '8px', fontFamily: 'Outfit', fontSize: '13px', fontWeight: 500, color: 'var(--text-1)'
              }}>
                Join Bunker
              </div>
            </div>
          ))}
          {bunkers.length === 0 && (
            <div style={{ color: 'var(--text-3)', fontFamily: 'Outfit', fontSize: '14px', padding: '20px 0' }}>
              No active Bunkers right now.
            </div>
          )}
          {/* Create Bunker card */}
          <div className="card-shadow" style={{
            width: '200px', flexShrink: 0, backgroundColor: 'var(--surface)',
            borderRadius: '16px', padding: '16px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: '1px dashed var(--divider)', gap: '8px'
          }}>
            <div style={{ fontSize: '24px', color: 'var(--text-3)' }}>🎙</div>
            <span style={{ color: 'var(--text-3)', fontFamily: 'Outfit', fontSize: '13px' }}>Start a Bunker</span>
          </div>
        </div>
      </div>

      {/* Intel Channels */}
      <div style={{ padding: '0 24px' }}>
        <h3 style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', marginBottom: '16px', letterSpacing: '0.5px' }}>INTEL CHANNELS</h3>
        <div>
          {channels.map(ch => (
            <div key={ch.id} onClick={() => setOpenChannel(ch.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 0', borderBottom: '1px solid var(--divider)', cursor: 'pointer',
              }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '14px', color: ch.unread > 0 ? 'var(--text-1)' : 'var(--text-2)', fontWeight: ch.unread > 0 ? 600 : 400 }}>
                    {ch.name}
                  </span>
                  {ch.is_crisis && (
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--status-live)', animation: 'live-pulse 2s infinite' }} />
                  )}
                </div>
                <div style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                  {ch.last_message}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '12px' }}>
                {ch.unread > 0 && (
                  <div style={{
                    backgroundColor: ch.is_crisis ? 'var(--status-live)' : 'var(--accent)',
                    color: 'var(--bg)', borderRadius: '100px', padding: '2px 8px',
                    fontFamily: 'Outfit', fontSize: '11px', fontWeight: 600, minWidth: '24px', textAlign: 'center'
                  }}>
                    {ch.unread}
                  </div>
                )}
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)' }}>{ch.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
