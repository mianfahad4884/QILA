import React from 'react';
import { useParticipantTile, AudioTrack } from '@livekit/components-react';
import Avatar from './Avatar';

const SoundWaveBars = ({ isActive }) => (
  <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '18px', justifyContent: 'center' }}>
    {[0.6, 0.8, 0.5].map((duration, i) => (
      <div key={i} style={{
        width: '3px',
        borderRadius: '2px',
        backgroundColor: 'var(--accent)',
        minHeight: '3px',
        height: isActive ? '100%' : '3px',
        animation: isActive ? `bar-wave ${duration}s ease-in-out infinite alternate` : 'none',
      }} />
    ))}
  </div>
);

export default function LiveKitParticipant({ participant }) {
  const { elementProps, isSpeaking } = useParticipantTile({
    participant,
  });

  const metadata = participant.metadata ? JSON.parse(participant.metadata) : {};
  const ciScore = metadata.ciScore || 0;
  const initials = participant.identity.substring(0, 2).toUpperCase();

  return (
    <div {...elementProps} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '80px' }}>
      <div style={{
        borderRadius: '50%', padding: '3px',
        border: `2px solid ${isSpeaking ? 'var(--status-verified)' : 'var(--divider)'}`,
        animation: isSpeaking ? 'speaker-pulse 800ms ease-in-out infinite' : 'none',
        position: 'relative',
      }}>
        <Avatar size={60} ciScore={ciScore} initials={initials} />
        {!participant.isMicrophoneEnabled && (
          <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--surface)', borderRadius: '50%', padding: '2px', border: '1px solid var(--divider)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--status-live)" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </div>
        )}
      </div>
      <SoundWaveBars isActive={isSpeaking && participant.isMicrophoneEnabled} />
      <div style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--text-2)', textAlign: 'center', width: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {participant.name || participant.identity}
      </div>
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-3)' }}>
        CI:{ciScore}
      </div>
      {/* Invisible audio track component */}
      <AudioTrack participant={participant} source="microphone" />
    </div>
  );
}
