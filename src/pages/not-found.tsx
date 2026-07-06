import { useLocation } from 'wouter';

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="app-bg" />
      <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 320, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚽</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>404 — Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>This page doesn't exist.</p>
        <button className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14 }} onClick={() => setLocation('/')}>
          Go Home
        </button>
      </div>
    </div>
  );
}
