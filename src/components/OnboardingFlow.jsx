import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const THEATERS = [
  { slug: 'indo-pacific', name: 'Indo-Pacific' },
  { slug: 'eastern-europe', name: 'Eastern Europe' },
  { slug: 'mena', name: 'MENA' },
  { slug: 'sub-saharan-africa', name: 'Sub-Saharan Africa' },
  { slug: 'latin-america', name: 'Latin America' },
  { slug: 'arctic', name: 'Arctic' },
  { slug: 'central-asia', name: 'Central Asia' },
  { slug: 'south-asia', name: 'South Asia' },
];

const DOMAINS = [
  { slug: 'cyber', name: 'Cyber' },
  { slug: 'nuclear', name: 'Nuclear Watch' },
  { slug: 'naval', name: 'Naval' },
  { slug: 'aviation', name: 'Aviation' },
  { slug: 'supply-chain', name: 'Supply Chain' },
  { slug: 'information-ops', name: 'Information Ops' },
  { slug: 'economics', name: 'Economics & Sanctions' },
  { slug: 'space', name: 'Space & ISR' },
];

export default function OnboardingFlow() {
  const { completeOnboarding } = useApp();
  const [screen, setScreen] = useState(0);
  const [selectedTheaters, setSelectedTheaters] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [animating, setAnimating] = useState(false);

  const next = () => {
    setAnimating(true);
    setTimeout(() => { setScreen(s => s + 1); setAnimating(false); }, 280);
  };

  const toggleItem = (list, setList, slug) => {
    setList(prev => prev.includes(slug) ? prev.filter(x => x !== slug) : [...prev, slug]);
  };

  const containerStyle = {
    position: 'fixed', inset: 0,
    backgroundColor: 'var(--bg)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 999,
    opacity: animating ? 0 : 1,
    transition: 'opacity 280ms ease',
    padding: '24px',
  };

  // Screen 0 — Splash
  if (screen === 0) return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '56px', color: 'var(--text-1)', marginBottom: '16px', animation: 'card-enter 600ms ease forwards' }}>
          QILA
        </div>
        <div style={{ fontFamily: 'Outfit', fontSize: '16px', color: 'var(--text-2)', fontWeight: 300 }}>
          Where the world thinks out loud.
        </div>
      </div>
      <div style={{ animation: 'card-enter 600ms 400ms ease both' }}>
        <button onClick={next} style={{
          width: '240px', padding: '16px', backgroundColor: 'var(--surface-raised)',
          color: 'var(--text-1)', border: '1px solid var(--divider)', borderRadius: '12px',
          fontFamily: 'Outfit', fontSize: '16px', fontWeight: 500, cursor: 'pointer',
          letterSpacing: '0.2px'
        }}>
          Get Started
        </button>
        <div style={{ marginTop: '16px', textAlign: 'center', color: 'var(--text-3)', fontSize: '14px', cursor: 'pointer' }}>
          I have an account
        </div>
      </div>
    </div>
  );

  // Screen 1 — Theaters
  if (screen === 1) return (
    <div style={{ ...containerStyle, justifyContent: 'flex-start', paddingTop: '60px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: '28px', color: 'var(--text-1)', marginBottom: '8px' }}>
          Your Theaters
        </h2>
        <p style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-2)', marginBottom: '32px' }}>
          Pick the regions you follow. You can change these anytime.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          {THEATERS.map(t => (
            <div key={t.slug} onClick={() => toggleItem(selectedTheaters, setSelectedTheaters, t.slug)}
              style={{
                padding: '20px 16px', backgroundColor: 'var(--surface)', borderRadius: '16px',
                border: `1px solid ${selectedTheaters.includes(t.slug) ? 'var(--accent)' : 'var(--divider)'}`,
                cursor: 'pointer', transition: 'all 200ms ease',
                backgroundColor: selectedTheaters.includes(t.slug) ? 'var(--accent-soft)' : 'var(--surface)',
              }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 500, color: 'var(--text-1)', fontSize: '15px' }}>{t.name}</div>
            </div>
          ))}
        </div>
        <button onClick={next} disabled={selectedTheaters.length === 0}
          style={{
            width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
            fontFamily: 'Outfit', fontSize: '15px', fontWeight: 500, cursor: selectedTheaters.length > 0 ? 'pointer' : 'not-allowed',
            backgroundColor: selectedTheaters.length > 0 ? 'var(--surface-raised)' : 'var(--surface)',
            color: selectedTheaters.length > 0 ? 'var(--text-1)' : 'var(--text-3)',
            transition: 'all 200ms ease'
          }}>
          Continue →
        </button>
      </div>
    </div>
  );

  // Screen 2 — Domains
  if (screen === 2) return (
    <div style={{ ...containerStyle, justifyContent: 'flex-start', paddingTop: '60px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: '28px', color: 'var(--text-1)', marginBottom: '8px' }}>
          Your Domains
        </h2>
        <p style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-2)', marginBottom: '32px' }}>
          Select your domain interests. Skip if you prefer to browse first.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          {DOMAINS.map(d => (
            <div key={d.slug} onClick={() => toggleItem(selectedDomains, setSelectedDomains, d.slug)}
              style={{
                padding: '20px 16px', borderRadius: '16px',
                border: `1px solid ${selectedDomains.includes(d.slug) ? 'var(--accent)' : 'var(--divider)'}`,
                cursor: 'pointer', transition: 'all 200ms ease',
                backgroundColor: selectedDomains.includes(d.slug) ? 'var(--accent-soft)' : 'var(--surface)',
              }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 500, color: 'var(--text-1)', fontSize: '15px' }}>{d.name}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={next} style={{
            flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid var(--divider)',
            fontFamily: 'Outfit', fontSize: '15px', cursor: 'pointer',
            backgroundColor: 'transparent', color: 'var(--text-3)'
          }}>Skip</button>
          <button onClick={next} style={{
            flex: 2, padding: '16px', borderRadius: '12px', border: 'none',
            fontFamily: 'Outfit', fontSize: '15px', fontWeight: 500, cursor: 'pointer',
            backgroundColor: 'var(--surface-raised)', color: 'var(--text-1)',
          }}>Continue →</button>
        </div>
      </div>
    </div>
  );

  // Screen 3 — Handle
  if (screen === 3) return (
    <div style={{ ...containerStyle, justifyContent: 'flex-start', paddingTop: '60px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: '28px', color: 'var(--text-1)', marginBottom: '8px' }}>
          Your Handle
        </h2>
        <p style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-2)', marginBottom: '32px' }}>
          This is how other analysts will identify you.
        </p>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontFamily: 'Outfit', fontSize: '12px', color: 'var(--text-3)', marginBottom: '8px', letterSpacing: '0.5px' }}>
            DISPLAY NAME
          </label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)}
            placeholder="e.g. StrategyDesk" style={{
              width: '100%', padding: '14px 16px', backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--divider)', borderRadius: '12px', color: 'var(--text-1)',
              fontFamily: 'Outfit', fontSize: '16px', outline: 'none', boxSizing: 'border-box'
            }} />
        </div>
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontFamily: 'Outfit', fontSize: '12px', color: 'var(--text-3)', marginBottom: '8px', letterSpacing: '0.5px' }}>
            HANDLE
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontFamily: 'Outfit', fontSize: '16px' }}>@</span>
            <input value={handle} onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="yourhandle" style={{
                width: '100%', padding: '14px 16px 14px 32px', backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--divider)', borderRadius: '12px', color: 'var(--text-1)',
                fontFamily: 'Outfit', fontSize: '16px', outline: 'none', boxSizing: 'border-box'
              }} />
          </div>
        </div>
        <button onClick={next} disabled={!handle || !displayName}
          style={{
            width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
            fontFamily: 'Outfit', fontSize: '15px', fontWeight: 500,
            cursor: handle && displayName ? 'pointer' : 'not-allowed',
            backgroundColor: handle && displayName ? 'var(--surface-raised)' : 'var(--surface)',
            color: handle && displayName ? 'var(--text-1)' : 'var(--text-3)',
          }}>
          Enter QILA →
        </button>
      </div>
    </div>
  );

  // Screen 4 — final transition
  if (screen === 4) {
    setTimeout(completeOnboarding, 1200);
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', animation: 'card-enter 600ms ease forwards' }}>
          <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '48px', color: 'var(--text-1)', marginBottom: '16px' }}>
            QILA
          </div>
          <div style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-2)' }}>
            The wire is live.
          </div>
        </div>
      </div>
    );
  }

  return null;
}
