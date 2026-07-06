import { useState } from 'react';
import { useLocation } from 'wouter';
import { getMatchResults, saveMatchResults, type MatchResults } from '@/lib/storage';

const PORTUGAL_PLAYERS = [
  'Cristiano Ronaldo', 'Bruno Fernandes', 'Rafael Leão',
  'João Cancelo', 'Rúben Dias', 'Renato Veiga', 'Nuno Mendes',
  'João Neves', 'Vitinha', 'Francisco Conceição',
];
const SPAIN_PLAYERS = [
  'Lamine Yamal', 'Pedri', 'Rodri', 'Dani Olmo',
  'Pedro Porro', 'Pau Cubarsí', 'Aymeric Laporte', 'Marc Cucurella',
  'Álex Baena', 'Mikel Oyarzabal',
];

function NumberInput({ label, value, onChange, min = 0, max = 20 }: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {label}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={e => onChange(parseInt(e.target.value) || 0)}
        style={{
          width: '100%', background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
          color: '#fff', fontFamily: 'inherit', fontSize: 14,
          padding: '10px 12px', outline: 'none',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      />
    </div>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const existing = getMatchResults() || {};
  const [results, setResults] = useState<MatchResults>(existing);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof MatchResults>(k: K, v: MatchResults[K]) => {
    setResults(r => ({ ...r, [k]: v }));
    setSaved(false);
  };

  const handleSave = () => {
    saveMatchResults(results);
    setSaved(true);
  };

  return (
    <div className="page" style={{ maxWidth: 480, margin: '0 auto', paddingTop: 0 }}>
      <div className="app-bg" />

      {/* Header */}
      <div style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 24, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
        <h1 style={{ fontSize: 24, fontWeight: 900 }}>Admin Panel</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Enter actual match results — scores recalculate instantly</p>
      </div>

      <div className="card" style={{ padding: '20px 18px', position: 'relative', zIndex: 1, marginBottom: 12 }}>
        <div className="section-header"><span className="section-dot" />Score</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <NumberInput label="Portugal Goals" value={results.scorePortugal} onChange={v => set('scorePortugal', v)} />
          <NumberInput label="Spain Goals" value={results.scoreSpain} onChange={v => set('scoreSpain', v)} />
        </div>

        <div className="section-header"><span className="section-dot" />Match Outcome</div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Winner</label>
          <div className="winner-group">
            {(['Portugal', 'Draw', 'Spain'] as const).map(opt => (
              <button key={opt} type="button"
                className={`winner-btn ${results.winner === opt ? 'active' : ''}`}
                onClick={() => set('winner', opt)}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Total Goals</label>
            <div className="toggle-group">
              {(['over', 'under'] as const).map(opt => (
                <button key={opt} type="button"
                  className={`toggle-btn ${results.totalGoals === opt ? 'active' : ''}`}
                  onClick={() => set('totalGoals', opt)}>
                  {opt === 'over' ? 'Over 2' : 'Under 2'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Both Teams to Score?</label>
            <div className="toggle-group">
              {(['yes', 'no'] as const).map(opt => (
                <button key={opt} type="button"
                  className={`toggle-btn ${results.bothTeamsScore === opt ? 'active' : ''}`}
                  onClick={() => set('bothTeamsScore', opt)}>
                  {opt === 'yes' ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="section-header"><span className="section-dot" />Player Awards</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Man of the Match</label>
            <div className="sel-wrap">
              <select value={results.manOfMatch || ''} onChange={e => set('manOfMatch', e.target.value)}>
                <option value="">-- Select Player --</option>
                <optgroup label="Portugal">{PORTUGAL_PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}</optgroup>
                <optgroup label="Spain">{SPAIN_PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}</optgroup>
              </select>
              <span className="sel-arrow">▾</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>First Goalscorer</label>
            <div className="sel-wrap">
              <select value={results.firstGoalscorer || ''} onChange={e => set('firstGoalscorer', e.target.value)}>
                <option value="">-- Select Player --</option>
                <optgroup label="Portugal">{PORTUGAL_PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}</optgroup>
                <optgroup label="Spain">{SPAIN_PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}</optgroup>
              </select>
              <span className="sel-arrow">▾</span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Did Ronaldo Score?</label>
          <div className="toggle-group" style={{ maxWidth: 200 }}>
            {(['yes', 'no'] as const).map(opt => (
              <button key={opt} type="button"
                className={`toggle-btn ${results.ronaldoScores === opt ? 'active' : ''}`}
                onClick={() => set('ronaldoScores', opt)}>
                {opt === 'yes' ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>

        <div className="section-header"><span className="section-dot" />Match Statistics</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <NumberInput label="Portugal Possession %" value={results.possessionPortugal} onChange={v => set('possessionPortugal', v)} min={0} max={100} />
          <NumberInput label="Shots — Portugal" value={results.shotsPortugal} onChange={v => set('shotsPortugal', v)} />
          <NumberInput label="Shots — Spain" value={results.shotsSpain} onChange={v => set('shotsSpain', v)} />
          <NumberInput label="Corners — Portugal" value={results.cornersPortugal} onChange={v => set('cornersPortugal', v)} />
          <NumberInput label="Corners — Spain" value={results.cornersSpain} onChange={v => set('cornersSpain', v)} />
          <NumberInput label="Yellow Cards — Portugal" value={results.yellowCardsPortugal} onChange={v => set('yellowCardsPortugal', v)} min={0} max={11} />
          <NumberInput label="Yellow Cards — Spain" value={results.yellowCardsSpain} onChange={v => set('yellowCardsSpain', v)} min={0} max={11} />
          <NumberInput label="Red Cards — Portugal" value={results.redCardsPortugal} onChange={v => set('redCardsPortugal', v)} min={0} max={11} />
          <NumberInput label="Red Cards — Spain" value={results.redCardsSpain} onChange={v => set('redCardsSpain', v)} min={0} max={11} />
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, marginBottom: 16 }}>
        <button className="btn btn-danger" style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 12 }} onClick={handleSave}>
          {saved ? '✅ Saved — Scores Updated!' : '💾 Save Results & Recalculate Scores'}
        </button>
      </div>

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, paddingBottom: 32 }}>
        <button onClick={() => setLocation('/leaderboard')} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
        }}>🏆 View Leaderboard</button>
        <span style={{ color: 'var(--text-dim)', margin: '0 8px' }}>·</span>
        <button onClick={() => setLocation('/')} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
        }}>← Home</button>
      </div>
    </div>
  );
}
