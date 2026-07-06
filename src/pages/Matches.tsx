import { useLocation } from 'wouter';
import { getCurrentPlayer } from '@/lib/storage';

function FlagImg({ code, name, size = 52 }: { code: string; name: string; size?: number }) {
  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt={name}
      width={size}
      height={Math.round(size * 0.67)}
      style={{ borderRadius: 6, objectFit: 'cover', boxShadow: '0 3px 10px rgba(0,0,0,0.5)' }}
      onError={e => {
        const el = e.currentTarget as HTMLImageElement;
        el.style.display = 'none';
        const parent = el.parentElement;
        if (parent && !parent.querySelector('.flag-fallback')) {
          const fb = document.createElement('div');
          fb.className = 'flag-fallback';
          fb.style.cssText = `width:${size}px;height:${Math.round(size * 0.67)}px;background:rgba(255,255,255,0.06);border:1px dashed rgba(255,255,255,0.2);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;color:rgba(255,255,255,0.35);`;
          fb.textContent = name.slice(0, 3).toUpperCase();
          parent.appendChild(fb);
        }
      }}
    />
  );
}

const MATCHES = [
  {
    id: 'mor-fra',
    teamA: { name: 'Morocco',   code: 'ma' },
    teamB: { name: 'France',    code: 'fr' },
    competition: 'FIFA Club World Cup',
    locked: true,
  },
  {
    id: 'arg-egy',
    teamA: { name: 'Argentina', code: 'ar' },
    teamB: { name: 'Egypt',     code: 'eg' },
    competition: 'FIFA Club World Cup',
    locked: true,
  },
  {
    id: 'por-esp',
    teamA: { name: 'Portugal',  code: 'pt' },
    teamB: { name: 'Spain',     code: 'es' },
    competition: 'UEFA Nations League Final',
    locked: false,
  },
];

export default function Matches() {
  const [, setLocation] = useLocation();
  const player = getCurrentPlayer();

  if (!player) {
    setLocation('/');
    return null;
  }

  return (
    <div className="page" style={{ paddingTop: 0, maxWidth: 480, margin: '0 auto' }}>
      <div className="app-bg" />

      {/* ── Top Header Bar ────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(34,197,94,0.14) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(34,197,94,0.12)',
        padding: '40px 20px 28px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo mark */}
        <div style={{
          width: 56, height: 56,
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(34,197,94,0.30)',
        }}>⚽</div>

        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1.1 }}>
          Match <span className="text-green">Predictor</span>
        </h1>
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          Welcome back, <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{player}</strong>
        </p>
      </div>

      {/* ── Section Label ─────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '20px 4px 12px',
        position: 'relative', zIndex: 1,
      }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Select Match</span>
        <span style={{
          fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
          background: 'rgba(148,163,184,0.10)', padding: '2px 8px', borderRadius: 20,
        }}>3 matches</span>
      </div>

      {/* ── Match Cards ───────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
        {MATCHES.map((m, idx) => (
          <div
            key={m.id}
            className={`match-card ${m.locked ? 'locked' : 'playable'} fade-up`}
            style={{ animationDelay: `${idx * 0.07}s`, opacity: 0 }}
          >
            {/* Top accent stripe */}
            <div className={`match-card-accent ${m.locked ? 'locked-accent' : 'live-accent'}`} />

            <div style={{ padding: '16px 18px 18px' }}>
              {/* Row 1: badge + competition */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 16,
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: 0.3 }}>
                  {m.competition}
                </span>
                {m.locked
                  ? <span className="status-badge">🔒 Upcoming</span>
                  : <span className="live-badge"><span className="live-dot" />LIVE</span>
                }
              </div>

              {/* Row 2: teams */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                marginBottom: 18,
              }}>
                {/* Team A */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                  <FlagImg code={m.teamA.code} name={m.teamA.name} size={50} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{m.teamA.name}</span>
                </div>

                {/* VS pill */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0,
                }}>
                  <div style={{
                    background: 'var(--surface-hi)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontWeight: 900, fontSize: 13, color: 'var(--text-muted)', letterSpacing: 1,
                  }}>VS</div>
                </div>

                {/* Team B */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <FlagImg code={m.teamB.code} name={m.teamB.name} size={50} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{m.teamB.name}</span>
                </div>
              </div>

              {/* Row 3: CTA */}
              {m.locked ? (
                <div style={{
                  textAlign: 'center', padding: '10px 14px',
                  background: 'rgba(148,163,184,0.06)',
                  borderRadius: 10, fontSize: 13,
                  color: 'var(--text-dim)', fontWeight: 600,
                  border: '1px solid var(--border)',
                }}>Predictions open soon</div>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '13px', fontSize: 14, letterSpacing: 0.3 }}
                  onClick={() => setLocation('/predict')}
                >
                  Make Your Prediction →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <div style={{
        textAlign: 'center', marginTop: 32, paddingBottom: 20,
        position: 'relative', zIndex: 1,
        display: 'flex', justifyContent: 'center', gap: 8,
      }}>
        <button onClick={() => setLocation('/leaderboard')} style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 13,
          fontWeight: 600, cursor: 'pointer', padding: '8px 16px',
          borderRadius: 20, transition: 'all 0.18s',
        }}>🏆 Leaderboard</button>
        <button onClick={() => setLocation('/')} style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 13,
          fontWeight: 600, cursor: 'pointer', padding: '8px 16px',
          borderRadius: 20, transition: 'all 0.18s',
        }}>← Change Name</button>
      </div>
    </div>
  );
}
