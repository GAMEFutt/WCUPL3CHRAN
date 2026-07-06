import { useLocation } from 'wouter';
import { getSubmissions, getMatchResults } from '@/lib/storage';

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const submissions = getSubmissions().sort((a, b) => b.score - a.score);
  const raw = getMatchResults();
  const hasResults = raw !== null &&
    raw.scorePortugal !== undefined &&
    raw.scoreSpain !== undefined &&
    !!raw.winner;

  return (
    <div className="page" style={{ maxWidth: 480, margin: '0 auto', paddingTop: 0 }}>
      <div className="app-bg" />

      {/* Header */}
      <div style={{ textAlign: 'center', paddingTop: 48, paddingBottom: 24, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🏆</div>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>Leaderboard</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Portugal vs Spain · UEFA Nations League Final</p>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {submissions.length === 0 ? (
          <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🤷</div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>No predictions yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Be the first to submit your predictions!</p>
            <button className="btn btn-primary" style={{ marginTop: 20, padding: '12px 28px' }} onClick={() => setLocation('/')}>
              Go Predict
            </button>
          </div>
        ) : !hasResults ? (
          <div>
            <div style={{
              textAlign: 'center', padding: '12px 16px',
              background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.2)',
              borderRadius: 10, marginBottom: 16,
              fontSize: 13, color: 'rgba(255,200,100,0.85)',
            }}>
              ⏳ Results not entered yet — scores will appear after the match.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {submissions.map((sub, i) => (
                <div key={sub.id} className="lb-row">
                  <span className={`lb-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                  </span>
                  <span style={{ flex: 1, fontWeight: 600 }}>{sub.playerName}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Pending</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {submissions.map((sub, i) => (
              <div key={sub.id} className="lb-row">
                <span className={`lb-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <span style={{ flex: 1, fontWeight: 600 }}>{sub.playerName}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 16 }}>
                    {sub.score.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {sub.correctCount} / 17 correct
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 28, position: 'relative', zIndex: 1, paddingBottom: 32, display: 'flex', justifyContent: 'center', gap: 20 }}>
        <button onClick={() => setLocation('/')} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
        }}>← Home</button>
        <button onClick={() => setLocation('/admin')} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
        }}>🔐 Admin</button>
      </div>
    </div>
  );
}
