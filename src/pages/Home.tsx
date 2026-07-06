import { useState } from 'react';
import { useLocation } from 'wouter';
import { getCurrentPlayer, setCurrentPlayer } from '@/lib/storage';

export default function Home() {
  const [name, setName] = useState(getCurrentPlayer() || '');
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();

  const handleOK = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name to continue.');
      return;
    }
    setCurrentPlayer(name.trim());
    setError('');
    setLocation('/matches');
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="app-bg" />

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 40, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>⚽</div>
        <h1 style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px' }}>
          Football<br />
          <span className="text-green">Match Predictor</span>
        </h1>
      </div>

      {/* Login card */}
      <div className="card" style={{
        width: '100%', maxWidth: 400,
        padding: '32px 28px',
        position: 'relative', zIndex: 1,
      }}>
        <form onSubmit={handleOK}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', fontSize: 24,
            }}>👤</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)' }}>Enter Your Name</p>
          </div>

          <input
            id="playerName"
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="Your name..."
            autoFocus
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.4)',
              border: `1px solid ${error ? 'rgba(255,59,59,0.5)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 10,
              color: '#fff',
              fontFamily: 'inherit',
              fontSize: 15,
              padding: '13px 16px',
              outline: 'none',
              marginBottom: 12,
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = error ? 'rgba(255,59,59,0.5)' : 'rgba(255,255,255,0.1)'; }}
          />

          {error && (
            <p style={{ color: '#ff6b6b', fontSize: 12, marginBottom: 12 }}>{error}</p>
          )}

          <button type="submit" className="btn btn-primary" style={{
            width: '100%', padding: '15px', fontSize: 17, borderRadius: 12, letterSpacing: 0.5,
          }}>
            OK →
          </button>
        </form>
      </div>
    </div>
  );
}
