import React, { useState, useEffect } from 'react';
import { 
  LiveKitRoom, 
  RoomAudioRenderer, 
  useParticipants, 
  useTracks,
  useLocalParticipant,
  LocalAudioTrack,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useApp } from '../context/AppContext';
import LiveKitParticipant from '../components/LiveKitParticipant';

export default function VoiceBunkerScreen({ bunkerId, onBack }) {
  const { bunkers, session } = useApp();
  const [token, setToken] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [wsUrl, setWsUrl] = useState(null);
  const [error, setError] = useState(null);

  const bunker = bunkers.find(b => b.id === bunkerId);

  useEffect(() => {
    async function getJoinToken() {
      if (!bunkerId || !session) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bunkers/${bunkerId}/join`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setToken(data.token);
        setRoomName(data.roomName);
        setWsUrl(data.wsUrl);
      } catch (err) {
        setError(err.message);
      }
    }
    getJoinToken();
  }, [bunkerId, session]);

  if (!bunker) return null;
  if (error) return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--bg)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ color: 'var(--status-live)', marginBottom: '12px' }}>Connection Error</h3>
        <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>{error}</p>
        <button onClick={onBack} style={{ marginTop: '24px', padding: '10px 20px', backgroundColor: 'var(--surface-raised)', color: 'var(--text-1)', border: '1px solid var(--divider)', borderRadius: '8px' }}>Exit</button>
      </div>
    </div>
  );

  if (!token) return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--bg)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--divider)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'live-pulse 1s infinite linear', margin: '0 auto 16px' }} />
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: 'var(--text-3)' }}>SECURE HANDSHAKE...</div>
      </div>
    </div>
  );

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={wsUrl}
      connectOptions={{ autoSubscribe: true }}
      onDisconnected={onBack}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--bg)', zIndex: 150, display: 'flex', flexDirection: 'column' }}
    >
      <BunkerContent bunker={bunker} onBack={onBack} />
    </LiveKitRoom>
  );
}

function BunkerContent({ bunker, onBack }) {
  const participants = useParticipants();
  const { isMicrophoneEnabled, setMicrophoneEnabled } = useLocalParticipant();
  const [hasRequestedMic, setHasRequestedMic] = useState(false);

  return (
    <>
      {/* Header */}
      <div style={{ padding: '20px 24px 0', paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Outfit', fontSize: '15px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,69,58,0.12)', padding: '4px 10px', borderRadius: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-live)', animation: 'live-pulse 2s infinite' }} />
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--status-live)' }}>LIVE</span>
          </div>
        </div>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: '26px', color: 'var(--text-1)', marginBottom: '6px' }}>
          {bunker.title}
        </h2>
        <div style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-2)', marginBottom: '4px' }}>
          Hosted by {bunker.host.display_name}
        </div>
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: 'var(--text-3)' }}>
          {participants.length} connected
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }}>
        {/* ON MIC Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', marginBottom: '20px', letterSpacing: '0.5px' }}>
            — ON MIC ——————————————
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {participants.filter(p => p.isMicrophoneEnabled).map(p => (
              <LiveKitParticipant key={p.identity} participant={p} />
            ))}
          </div>
        </div>

        {/* LISTENING Section */}
        <div>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)', marginBottom: '16px', letterSpacing: '0.5px' }}>
            — LISTENING ————————————
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {participants.filter(p => !p.isMicrophoneEnabled).map(p => (
              <div key={p.identity} style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: 'var(--surface-raised)', border: '1px solid var(--divider)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Outfit', fontSize: '11px', color: 'var(--text-3)',
                title: p.name || p.identity
              }}>
                {(p.name || p.identity).substring(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      <RoomAudioRenderer />

      {/* Action Bar */}
      <div style={{
        padding: '16px 24px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        borderTop: '1px solid var(--divider)', backgroundColor: 'var(--surface)',
        display: 'flex', gap: '12px',
      }}>
        <button onClick={() => setHasRequestedMic(!hasRequestedMic)}
          style={{
            flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${hasRequestedMic ? 'var(--status-verified)' : 'var(--divider)'}`,
            backgroundColor: hasRequestedMic ? 'rgba(52,199,89,0.08)' : 'var(--surface-raised)',
            color: hasRequestedMic ? 'var(--status-verified)' : 'var(--text-2)',
            fontFamily: 'Outfit', fontSize: '14px', cursor: 'pointer', transition: 'all 200ms',
          }}>
          {hasRequestedMic ? '✓ Requested' : '🙋 Request Mic'}
        </button>
        <button onClick={() => setMicrophoneEnabled(!isMicrophoneEnabled)}
          style={{
            width: '52px', padding: '14px', borderRadius: '12px',
            border: '1px solid var(--divider)', backgroundColor: 'var(--surface-raised)',
            color: !isMicrophoneEnabled ? 'var(--status-live)' : 'var(--text-2)', cursor: 'pointer',
            fontFamily: 'Outfit', fontSize: '18px',
          }}>
          {!isMicrophoneEnabled ? '🔇' : '🎙'}
        </button>
        <button onClick={onBack}
          style={{
            flex: 1, padding: '14px', borderRadius: '12px',
            border: '1px solid var(--divider)', backgroundColor: 'var(--surface-raised)',
            color: 'var(--status-live)', fontFamily: 'Outfit', fontSize: '14px', cursor: 'pointer'
          }}>
          Exit Bunker
        </button>
      </div>
    </>
  );
}
