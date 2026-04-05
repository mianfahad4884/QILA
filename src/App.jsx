import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import OnboardingFlow from './components/OnboardingFlow';
import ComposeSheet from './components/ComposeSheet';
import NotificationsScreen from './screens/NotificationsScreen';
import WireScreen from './screens/WireScreen';
import SectorsScreen from './screens/SectorsScreen';
import OpsScreen from './screens/OpsScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadNotifCount } = useApp();

  const tabs = [
    { id: '/', label: 'Wire', icon: WireIcon },
    { id: '/sectors', label: 'Sectors', icon: SectorsIcon },
    { id: '/ops', label: 'Ops', icon: OpsIcon, dot: 'live' },
    { id: '/discover', label: 'Discover', icon: DiscoverIcon, crisisDot: true },
    { id: '/profile', label: 'Me', icon: ProfileIcon },
  ];

  const currentIndex = tabs.findIndex(tab => location.pathname === tab.id);

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: '80px', maxWidth: '480px', margin: '0 auto',
      backgroundColor: 'rgba(22,22,24,0.9)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--divider)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      paddingBottom: '16px', zIndex: 100,
    }}>
      {currentIndex >= 0 && (
        <div style={{
          position: 'absolute', top: '10px',
          left: `calc(${currentIndex * 20}% + 10% - 28px)`,
          width: '56px', height: '32px',
          backgroundColor: 'var(--accent-soft)',
          borderRadius: '10px',
          transition: 'left 240ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          zIndex: 0,
        }} />
      )}
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.id;
        const Icon = tab.icon;
        return (
          <div key={tab.id} onClick={() => navigate(tab.id)} style={{
            position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', width: '20%', cursor: 'pointer',
            color: isActive ? 'var(--text-1)' : 'var(--text-3)', marginTop: '6px',
          }}>
            <div style={{ position: 'relative' }}>
              <Icon active={isActive} />
              {tab.dot && !isActive && (
                <div style={{ position: 'absolute', top: -2, right: -2, width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--status-verified)' }} />
              )}
            </div>
            <span style={{ fontSize: '10px', fontFamily: 'Outfit', fontWeight: 500, marginTop: '3px', transition: 'color 120ms ease' }}>
              {tab.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Custom icons matching QILA spec
const WireIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const SectorsIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const OpsIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="10" r="1" fill="currentColor"/>
  </svg>
);
const DiscoverIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={active ? 'currentColor' : 'none'}/>
  </svg>
);
const ProfileIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

function Header() {
  const { unreadNotifCount, showNotifications, setShowNotifications } = useApp();
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '64px',
      maxWidth: '480px', margin: '0 auto',
      backgroundColor: 'rgba(12,12,15,0.95)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', padding: '0 24px',
      zIndex: 100, borderBottom: '1px solid var(--divider)',
    }}>
      <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '22px', color: 'var(--text-1)', flex: 1 }}>
        QILA
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0, display: 'flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <button onClick={() => setShowNotifications(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: unreadNotifCount > 0 ? 'var(--text-1)' : 'var(--text-3)', padding: 0, display: 'flex', position: 'relative' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          {unreadNotifCount > 0 && (
            <div style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-verified)' }} />
          )}
        </button>
      </div>
    </div>
  );
}

function FloatingActionButton() {
  const { setShowCompose } = useApp();
  return (
    <div onClick={() => setShowCompose(true)} style={{
      position: 'fixed', bottom: '96px', right: '24px',
      width: '56px', height: '56px', borderRadius: '50%',
      backgroundColor: 'var(--surface-raised)', border: '1px solid var(--divider)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)', zIndex: 90, cursor: 'pointer',
      transition: 'transform 150ms ease',
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-1)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '32px', color: 'var(--text-1)', animation: 'live-pulse 2s infinite ease-in-out' }}>
        QILA
      </div>
    </div>
  );
}

function AppContent() {
  const { session, authLoading, hasOnboarded, showCompose, setShowCompose, showNotifications, setShowNotifications } = useApp();

  if (authLoading) return <LoadingScreen />;
  if (!session) return <AuthScreen />;
  if (!hasOnboarded) return <OnboardingFlow />;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      <Header />
      {showNotifications && <NotificationsScreen onClose={() => setShowNotifications(false)} />}
      {showCompose && <ComposeSheet onClose={() => setShowCompose(false)} />}
      <div style={{ paddingTop: '64px', paddingBottom: '90px' }}>
        <Routes>
          <Route path="/" element={<WireScreen />} />
          <Route path="/sectors" element={<SectorsScreen />} />
          <Route path="/ops" element={<OpsScreen />} />
          <Route path="/discover" element={<DiscoverScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Routes>
      </div>
      <FloatingActionButton />
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
