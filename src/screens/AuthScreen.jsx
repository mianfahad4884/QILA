import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { signUp } from '../lib/api';

const AuthScreen = () => {
  const { signIn } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp({ email, password, username, displayName, handle });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: 'var(--text-1)'
    }}>
      {/* Brand Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '48px',
        animation: 'card-enter 800ms ease forwards'
      }}>
        <h1 style={{ 
          fontFamily: 'Playfair Display', 
          fontSize: '48px', 
          fontStyle: 'italic',
          letterSpacing: '-1px',
          marginBottom: '8px'
        }}>QILA</h1>
        <p style={{ 
          color: 'var(--text-3)', 
          fontSize: '14px',
          fontWeight: 500,
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>Geopolitics. Analysis. Signal.</p>
      </div>

      {/* Auth Card */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        backgroundColor: 'var(--surface)',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid var(--divider)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        animation: 'card-enter 600ms ease forwards'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 600, 
          marginBottom: '24px',
          fontFamily: 'Outfit'
        }}>
          {isLogin ? 'Welcome Back' : 'Join QILA'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <>
              <Input 
                placeholder="Full Name" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                required 
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <Input 
                  placeholder="Username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
                <Input 
                  placeholder="Handle (e.g. jdoe)" 
                  value={handle} 
                  onChange={(e) => setHandle(e.target.value)} 
                  required 
                />
              </div>
            </>
          )}
          
          <Input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <Input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />

          {error && (
            <p style={{ color: 'var(--status-live)', fontSize: '13px', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              backgroundColor: 'var(--text-1)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '12px',
              transition: 'transform 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-3)',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
      
      {/* Footer Note */}
      <footer style={{ marginTop: '48px', color: 'var(--text-3)', fontSize: '12px', textAlign: 'center', opacity: 0.5 }}>
        QILA Standard v3.0 / Secure Verified Access
      </footer>
    </div>
  );
};

const Input = ({ ...props }) => (
  <input 
    {...props} 
    style={{
      backgroundColor: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--divider)',
      borderRadius: '12px',
      padding: '12px 16px',
      color: 'var(--text-1)',
      fontSize: '15px',
      width: '100%',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
    }}
    onFocus={(e) => e.target.style.borderColor = 'var(--text-3)'}
    onBlur={(e) => e.target.style.borderColor = 'var(--divider)'}
  />
);

export default AuthScreen;
