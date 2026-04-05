import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Avatar from '../components/Avatar';

const PinnedIntelDrop = ({ message }) => (
  <div style={{
    borderLeft: '2px solid var(--status-pending)', backgroundColor: 'var(--surface-raised)',
    borderRadius: '0 8px 8px 0', padding: '12px 14px', marginBottom: '8px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
      <span style={{ fontSize: '12px' }}>📌</span>
      <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.5px' }}>PINNED INTEL</span>
      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--status-pending)' }} />
      <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--status-pending)' }}>
        {message.pin_status === 'pending' ? 'UNVERIFIED' : 'VERIFIED'}
      </span>
    </div>
    <div style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-1)', marginBottom: '6px' }}>{message.body}</div>
    <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-3)' }}>
      Posted by {message.author.name} · CI:{message.author.ci_score}
    </div>
  </div>
);

const MessageBubble = ({ message }) => {
  if (message.is_pinned) return <PinnedIntelDrop message={message} />;

  return (
    <div style={{
      display: 'flex', flexDirection: message.is_mine ? 'row-reverse' : 'row',
      gap: '8px', marginBottom: '12px', alignItems: 'flex-end',
    }}>
      {!message.is_mine && (
        <Avatar size={28} ciScore={message.author.ci_score} initials={message.author.initials} />
      )}
      <div style={{ maxWidth: '75%' }}>
        {!message.is_mine && (
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-3)', marginBottom: '4px', paddingLeft: '4px' }}>
            {message.author.name} · CI:{message.author.ci_score}
          </div>
        )}
        <div style={{
          backgroundColor: message.is_mine ? '#2A2A30' : 'var(--surface-raised)',
          borderRadius: message.is_mine ? '18px 2px 18px 18px' : '2px 18px 18px 18px',
          padding: '10px 14px',
        }}>
          <div style={{ fontFamily: 'Outfit', fontSize: '15px', color: 'var(--text-1)', lineHeight: 1.5 }}>
            {message.body}
          </div>
        </div>
        <div style={{
          fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-3)',
          marginTop: '4px', textAlign: message.is_mine ? 'right' : 'left', paddingLeft: message.is_mine ? 0 : '4px'
        }}>
          {message.time}
        </div>
      </div>
    </div>
  );
};

const TypingBar = ({ value, setValue, onSend }) => {
  const canSend = value.trim().length > 0;
  return (
    <div style={{
      display: 'flex', gap: '8px', alignItems: 'center',
      padding: '12px 16px', borderTop: '1px solid var(--divider)',
      backgroundColor: 'var(--surface)'
    }}>
      <button style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--surface-raised)', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && canSend) { onSend(); } }}
        placeholder="Type a message..."
        style={{
          flex: 1, backgroundColor: 'var(--surface-raised)', border: '1px solid var(--divider)',
          borderRadius: '12px', padding: '10px 14px', color: 'var(--text-1)',
          fontFamily: 'Outfit', fontSize: '14px', outline: 'none',
        }}
      />
      <button onClick={onSend} disabled={!canSend}
        style={{
          width: '36px', height: '36px', borderRadius: '50%', border: 'none', cursor: canSend ? 'pointer' : 'default',
          backgroundColor: 'transparent',
          color: canSend ? 'var(--text-1)' : 'var(--text-3)',
          transition: 'color 160ms', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
  );
};

export default function ChatScreen({ channelId, onBack }) {
  const { channels, sendMessage } = useApp();
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef(null);

  const channel = channels.find(ch => ch.id === channelId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channel?.messages?.length]);

  if (!channel) return null;

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(channelId, inputValue.trim());
    setInputValue('');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'var(--bg)', zIndex: 150,
      display: 'flex', flexDirection: 'column',
      animation: 'slide-in-right 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '16px 20px', paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
        borderBottom: '1px solid var(--divider)', backgroundColor: 'var(--surface)'
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 0, display: 'flex' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '15px', color: 'var(--text-1)', fontWeight: 500 }}>{channel.name}</div>
          <div style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--text-3)' }}>{channel.sector}</div>
        </div>
        {channel.is_crisis && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(255,69,58,0.12)', padding: '3px 8px', borderRadius: '4px' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--status-live)', animation: 'live-pulse 2s infinite' }} />
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--status-live)' }}>LIVE</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        {channel.messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', fontFamily: 'Outfit', fontSize: '14px', marginTop: '40px' }}>
            This channel is open. Be the first to transmit.
          </div>
        ) : (
          channel.messages.map(msg => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <TypingBar value={inputValue} setValue={setInputValue} onSend={handleSend} />
    </div>
  );
}
