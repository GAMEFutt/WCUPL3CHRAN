import { useLocation } from 'wouter';
import { getCurrentPlayer, getSubmissionForPlayer, getMatchResults, type Predictions, type MatchResults } from '@/lib/storage';

type ResultRow = {
  icon: string;
  title: string;
  yours: string;
  actual: string | null;
  correct: boolean | null; // null = not yet judged
};

function buildRows(
  pred: Predictions | undefined,
  actual: MatchResults | null
): ResultRow[] {
  if (!pred) return [];

  const check = (a: string | number | undefined, b: string | number | undefined) => {
    if (a === undefined || a === null || b === undefined || b === null) return null;
    return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
  };

  const scoreStr = actual
    ? `${actual.scorePortugal ?? '?'} - ${actual.scoreSpain ?? '?'}`
    : null;
  const predScore = `${pred.scorePortugal} - ${pred.scoreSpain}`;
  const scoreCorrect = actual
    ? pred.scorePortugal === actual.scorePortugal && pred.scoreSpain === actual.scoreSpain
    : null;

  const ptPoss = pred.possessionPortugal;
  const asPoss = actual?.possessionPortugal;
  const possCorrect = asPoss !== undefined ? Math.abs(ptPoss - asPoss) <= 5 : null;
  const possStr = asPoss !== undefined ? `Portugal ${asPoss}%` : null;

  return [
    {
      icon: '⚽',
      title: 'Score Prediction',
      yours: `You predicted ${predScore}`,
      actual: scoreStr ? `Actual: ${scoreStr}` : null,
      correct: scoreCorrect,
    },
    {
      icon: '🏆',
      title: 'Winner Prediction',
      yours: `You predicted ${pred.winner || '—'}`,
      actual: actual?.winner ? `Actual: ${actual.winner}` : null,
      correct: check(pred.winner, actual?.winner),
    },
    {
      icon: '👟',
      title: 'First Scorer',
      yours: `You predicted ${pred.firstGoalscorer || '—'}`,
      actual: actual?.firstGoalscorer ? `Actual: ${actual.firstGoalscorer}` : null,
      correct: check(pred.firstGoalscorer, actual?.firstGoalscorer),
    },
    {
      icon: '⭐',
      title: 'Man of the Match',
      yours: `You predicted ${pred.manOfMatch || '—'}`,
      actual: actual?.manOfMatch ? `Actual: ${actual.manOfMatch}` : null,
      correct: check(pred.manOfMatch, actual?.manOfMatch),
    },
    {
      icon: '🎯',
      title: 'Both Teams to Score',
      yours: `You predicted ${pred.bothTeamsScore === 'yes' ? 'Yes' : pred.bothTeamsScore === 'no' ? 'No' : '—'}`,
      actual: actual?.bothTeamsScore ? `Actual: ${actual.bothTeamsScore === 'yes' ? 'Yes' : 'No'}` : null,
      correct: check(pred.bothTeamsScore, actual?.bothTeamsScore),
    },
    {
      icon: '👤',
      title: 'Ronaldo Scoring',
      yours: `You predicted ${pred.ronaldoScores === 'yes' ? 'Yes' : pred.ronaldoScores === 'no' ? 'No' : '—'}`,
      actual: actual?.ronaldoScores ? `Actual: ${actual.ronaldoScores === 'yes' ? 'Yes' : 'No'}` : null,
      correct: check(pred.ronaldoScores, actual?.ronaldoScores),
    },
    {
      icon: '📊',
      title: 'Possession Prediction',
      yours: `You predicted Portugal ${ptPoss}%`,
      actual: possStr ? `Actual: ${possStr}` : null,
      correct: possCorrect,
    },
    {
      icon: '📈',
      title: 'Total Goals',
      yours: `You predicted ${pred.totalGoals === 'over' ? 'Over 2' : pred.totalGoals === 'under' ? 'Under 2' : '—'}`,
      actual: actual?.totalGoals ? `Actual: ${actual.totalGoals === 'over' ? 'Over 2' : 'Under 2'}` : null,
      correct: check(pred.totalGoals, actual?.totalGoals),
    },
    {
      icon: '⚽',
      title: 'Shots on Target',
      yours: `You predicted ${pred.shotsPortugal} – ${pred.shotsSpain}`,
      actual: (actual?.shotsPortugal !== undefined && actual?.shotsSpain !== undefined)
        ? `Actual: ${actual.shotsPortugal} – ${actual.shotsSpain}` : null,
      correct: (actual?.shotsPortugal !== undefined && actual?.shotsSpain !== undefined)
        ? (pred.shotsPortugal === actual.shotsPortugal && pred.shotsSpain === actual.shotsSpain) : null,
    },
    {
      icon: '🚩',
      title: 'Corners',
      yours: `You predicted ${pred.cornersPortugal} – ${pred.cornersSpain}`,
      actual: (actual?.cornersPortugal !== undefined && actual?.cornersSpain !== undefined)
        ? `Actual: ${actual.cornersPortugal} – ${actual.cornersSpain}` : null,
      correct: (actual?.cornersPortugal !== undefined && actual?.cornersSpain !== undefined)
        ? (pred.cornersPortugal === actual.cornersPortugal && pred.cornersSpain === actual.cornersSpain) : null,
    },
    {
      icon: '🟨',
      title: 'Yellow Cards',
      yours: `You predicted ${pred.yellowCardsPortugal} – ${pred.yellowCardsSpain}`,
      actual: (actual?.yellowCardsPortugal !== undefined && actual?.yellowCardsSpain !== undefined)
        ? `Actual: ${actual.yellowCardsPortugal} – ${actual.yellowCardsSpain}` : null,
      correct: (actual?.yellowCardsPortugal !== undefined && actual?.yellowCardsSpain !== undefined)
        ? (pred.yellowCardsPortugal === actual.yellowCardsPortugal && pred.yellowCardsSpain === actual.yellowCardsSpain) : null,
    },
  ];
}

export default function Results() {
  const [, setLocation] = useLocation();
  const playerName = getCurrentPlayer();
  const submission = playerName ? getSubmissionForPlayer(playerName) : null;
  const actual = getMatchResults();
  const hasResults = actual !== null;

  if (!playerName || !submission) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="app-bg" />
        <div className="card" style={{ padding: 32, textAlign: 'center', maxWidth: 320, position: 'relative', zIndex: 1 }}>
          <p style={{ marginBottom: 16 }}>No predictions found.</p>
          <button className="btn btn-primary" style={{ padding: '12px 24px' }} onClick={() => setLocation('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const rows = buildRows(submission.predictions, actual);
  const correctCount = rows.filter(r => r.correct === true).length;
  const totalJudged = rows.filter(r => r.correct !== null).length;

  const copyReport = () => {
    const lines = [
      `⚽ Football Match Predictor — ${playerName}`,
      `Portugal vs Spain`,
      '',
      ...rows.map(r => `${r.title}: ${r.yours}${r.actual ? ` | ${r.actual}` : ''}${r.correct !== null ? (r.correct ? ' ✅' : ' ❌') : ''}`),
      '',
      hasResults ? `Score: ${correctCount}/${totalJudged}` : 'Results not yet available',
    ];
    navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
  };

  const shareWhatsApp = () => {
    const lines = [
      `⚽ *Football Match Predictor*`,
      `*Portugal vs Spain*`,
      `Player: *${playerName}*`,
      '',
      ...rows.map(r =>
        `• ${r.title}: ${r.yours.replace('You predicted ', '')}${r.actual ? ` → ${r.actual}` : ''}${r.correct !== null ? (r.correct ? ' ✅' : ' ❌') : ''}`
      ),
      '',
      hasResults ? `Final Score: *${correctCount}/${totalJudged}*` : '_Results coming soon_',
    ];
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/0777825017?text=${text}`, '_blank');
  };

  return (
    <div className="page" style={{ paddingTop: 0, maxWidth: 480, margin: '0 auto' }}>
      <div className="app-bg" />

      {/* Header */}
      <div style={{ textAlign: 'center', paddingTop: 48, paddingBottom: 24, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>⚽</div>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>
          Prediction <span className="text-green">Results</span>
        </h1>
        <p style={{
          fontSize: 13, color: 'var(--text-muted)', marginTop: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <span style={{ color: 'var(--text-dim)' }}>›››</span>
          Here's how you did!
          <span style={{ color: 'var(--text-dim)' }}>‹‹‹</span>
        </p>
      </div>

      {/* Player card */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 12, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(0,200,81,0.1)', border: '1px solid rgba(0,200,81,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
          }}>👤</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontWeight: 800, fontSize: 18 }}>{playerName}</span>
              <span style={{
                background: 'rgba(0,200,81,0.15)', border: '1px solid rgba(0,200,81,0.35)',
                color: 'var(--primary)', fontSize: 9, fontWeight: 800,
                padding: '2px 7px', borderRadius: 4, letterSpacing: 1, textTransform: 'uppercase',
              }}>Pro Predictor</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {hasResults
                ? `${correctCount}/${totalJudged} correct predictions`
                : 'Great effort! Check out your prediction results below.'}
            </p>
          </div>
        </div>

        {/* Match */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '10px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="https://flagcdn.com/w80/pt.png" alt="Portugal" width={28} height={19} style={{ borderRadius: 3, objectFit: 'cover' }} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Portugal</span>
          </div>
          <span style={{ fontWeight: 900, color: 'var(--text-muted)' }}>VS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Spain</span>
            <img src="https://flagcdn.com/w80/es.png" alt="Spain" width={28} height={19} style={{ borderRadius: 3, objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      {/* Predictions list */}
      <div className="card" style={{ padding: '18px 16px', marginBottom: 16, position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 16,
          fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}>
          <span style={{ color: 'var(--text-dim)' }}>››</span>
          Your Predictions
          <span style={{ color: 'var(--text-dim)' }}>‹‹</span>
        </div>

        {!hasResults && (
          <div style={{
            textAlign: 'center', padding: '12px',
            background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.2)',
            borderRadius: 8, marginBottom: 14, fontSize: 12, color: 'rgba(255,200,100,0.8)',
          }}>
            ⏳ Results will appear once the match ends and admin enters the actual scores.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map((row, i) => (
            <div key={i} className="result-item">
              <div className="result-icon">{row.icon}</div>
              <div className="result-info">
                <div className="result-title">{row.title}</div>
                <div className="result-yours">{row.yours}</div>
              </div>
              {row.actual && (
                <div className={`result-actual ${row.correct === true ? 'correct' : row.correct === false ? 'wrong' : ''}`}>
                  {row.actual}
                </div>
              )}
              {row.correct !== null && (
                <div style={{ fontSize: 18, flexShrink: 0 }}>
                  {row.correct ? '✅' : '❌'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, position: 'relative', zIndex: 1 }}>
        <button
          className="btn btn-secondary"
          style={{ flex: 1, padding: '14px', fontSize: 14 }}
          onClick={copyReport}
        >
          📋 Copy Report
        </button>
        <button
          className="btn"
          style={{
            flex: 1, padding: '14px', fontSize: 14,
            background: 'linear-gradient(135deg, #25d366, #1aa64b)',
            color: '#fff', fontWeight: 700, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
          onClick={shareWhatsApp}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          Share to WhatsApp
        </button>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, position: 'relative', zIndex: 1, paddingBottom: 32 }}>
        <button onClick={() => setLocation('/')} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
        }}>← Home</button>
        <button onClick={() => setLocation('/leaderboard')} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
        }}>🏆 Leaderboard</button>
      </div>
    </div>
  );
}
