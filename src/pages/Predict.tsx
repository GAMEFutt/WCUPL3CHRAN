import { useState, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { getCurrentPlayer, saveSubmission, type Predictions } from '@/lib/storage';

const PORTUGAL_PLAYERS = [
  'Cristiano Ronaldo', 'Bruno Fernandes', 'Rafael Leão',
  'João Cancelo', 'Rúben Dias', 'Renato Veiga', 'Nuno Mendes',
  'João Neves', 'Vitinha', 'Francisco Conceição','Mohamed zeghdani'
];
const SPAIN_PLAYERS = [
  'Lamine Yamal', 'Pedri', 'Rodri', 'Dani Olmo',
  'Pedro Porro', 'Pau Cubarsí', 'Aymeric Laporte', 'Marc Cucurella',
  'Álex Baena', 'Mikel Oyarzabal',
];

function FlagImg({ code, name, size = 44 }: { code: string; name: string; size?: number }) {
  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt={`${name} flag`}
      width={size}
      height={Math.round(size * 0.67)}
      style={{ borderRadius: 5, objectFit: 'cover', boxShadow: '0 2px 10px rgba(0,0,0,0.50)' }}
      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

/* ── SVG icons ───────────────────────────────────────────── */
function YellowCard() {
  return (
    <svg width="14" height="19" viewBox="0 0 14 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="14" height="19" rx="2.5" fill="url(#yc)"/>
      <defs>
        <linearGradient id="yc" x1="0" y1="0" x2="14" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FCD34D"/>
          <stop offset="1" stopColor="#D97706"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
function RedCard() {
  return (
    <svg width="14" height="19" viewBox="0 0 14 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="14" height="19" rx="2.5" fill="url(#rc)"/>
      <defs>
        <linearGradient id="rc" x1="0" y1="0" x2="14" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F87171"/>
          <stop offset="1" stopColor="#991B1B"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
function BallIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="8.5" fill="white" stroke="#e2e8f0" strokeWidth="0.5"/>
      <path d="M9 2.5L11.5 6H13.5L14.5 9L12 11.5L9 10.5L6 11.5L3.5 9L4.5 6H6.5L9 2.5Z" fill="#1e293b" opacity="0.85"/>
      <circle cx="9" cy="9" r="2" fill="#1e293b" opacity="0.7"/>
    </svg>
  );
}
function CornerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2 L2 14 Q2 14 14 14" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="2" cy="2" r="2" fill="#22c55e"/>
    </svg>
  );
}

const FORM_PORTUGAL = ['W', 'W', 'D', 'L', 'W'] as const;
const FORM_SPAIN    = ['W', 'W', 'W', 'D', 'W'] as const;

const DEFAULT: Predictions = {
  scorePortugal: 0,
  scoreSpain: 0,
  winner: '',
  totalGoals: '',
  bothTeamsScore: '',
  manOfMatch: '',
  firstGoalscorer: '',
  ronaldoScores: '',
  possessionPortugal: 50,
  shotsPortugal: 4,
  shotsSpain: 4,
  cornersPortugal: 4,
  cornersSpain: 4,
  yellowCardsPortugal: 1,
  yellowCardsSpain: 1,
  redCardsPortugal: 0,
  redCardsSpain: 0,
};

function Counter({ val, onChange }: { val: number; onChange: (v: number) => void }) {
  return (
    <div className="counter">
      <button className="counter-btn" type="button" onClick={() => onChange(Math.max(0, val - 1))}>−</button>
      <span className="counter-val">{val}</span>
      <button className="counter-btn" type="button" onClick={() => onChange(Math.min(20, val + 1))}>+</button>
    </div>
  );
}

function MiniCounter({ val, onChange, max = 20 }: { val: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div className="mini-counter">
      <button className="mini-counter-btn" type="button" onClick={() => onChange(Math.max(0, val - 1))}>−</button>
      <span className="mini-counter-val">{val}</span>
      <button className="mini-counter-btn" type="button" onClick={() => onChange(Math.min(max, val + 1))}>+</button>
    </div>
  );
}

type StatRowProps = {
  label: string;
  valLeft: number; valRight: number; maxVal: number;
  iconLeft: React.ReactNode; iconRight: React.ReactNode;
  onChangeLeft: (v: number) => void; onChangeRight: (v: number) => void;
  barColorLeft?: string; barColorRight?: string;
};

function StatRow({ label, valLeft, valRight, maxVal, iconLeft, iconRight, onChangeLeft, onChangeRight, barColorLeft, barColorRight }: StatRowProps) {
  const total = valLeft + valRight || 1;
  const leftPct = Math.round((valLeft / total) * 100);
  const rightPct = 100 - leftPct;

  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{
        textAlign: 'center', fontSize: 10, fontWeight: 700,
        color: 'var(--text-muted)', letterSpacing: 0.8, marginBottom: 8,
        textTransform: 'uppercase',
      }}>{label}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>{iconLeft}</span>
          <MiniCounter val={valLeft} onChange={onChangeLeft} max={maxVal} />
        </div>

        {/* Bar */}
        <div style={{ flex: 1, height: 5, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', display: 'flex' }}>
          <div style={{
            width: `${leftPct}%`,
            background: barColorLeft ?? 'var(--stat-green)',
            borderRadius: '3px 0 0 3px',
            transition: 'width 0.3s ease',
          }} />
          <div style={{
            width: `${rightPct}%`,
            background: barColorRight ?? 'var(--stat-blue)',
            borderRadius: '0 3px 3px 0',
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MiniCounter val={valRight} onChange={onChangeRight} max={maxVal} />
          <span style={{ display: 'flex', alignItems: 'center' }}>{iconRight}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Field label ────────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
      letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
    }}>{children}</p>
  );
}

export default function Predict() {
  const [, setLocation] = useLocation();
  const [pred, setPred] = useState<Predictions>(DEFAULT);
  const [error, setError] = useState('');
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const player = getCurrentPlayer();

  const set = <K extends keyof Predictions>(k: K, v: Predictions[K]) =>
    setPred(p => ({ ...p, [k]: v }));

  /* Possession drag */
  const calcPct = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return null;
    const rect = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
  };
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const pct = calcPct(e); if (pct !== null) set('possessionPortugal', pct);
  };
  const handleDragStart = useCallback(() => { dragging.current = true; }, []);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const pct = calcPct(e); if (pct !== null) set('possessionPortugal', pct);
  }, []);
  const handleDragEnd = useCallback(() => { dragging.current = false; }, []);

  const handleSubmit = () => {
    if (!player) { setLocation('/'); return; }
    if (!pred.winner)                                              { setError('Please select who will win.'); return; }
    if (!pred.bothTeamsScore)                                      { setError('Please answer Both Teams to Score.'); return; }
    if (!pred.totalGoals)                                          { setError('Please select Total Goals.'); return; }
    if (!pred.manOfMatch || pred.manOfMatch === '-- Select Player --')        { setError('Please select Man of the Match.'); return; }
    if (!pred.firstGoalscorer || pred.firstGoalscorer === '-- Select Player --') { setError('Please select First Goalscorer.'); return; }
    if (!pred.ronaldoScores)                                       { setError('Please answer Will Ronaldo Score.'); return; }
    setError('');
    saveSubmission(player, pred);
    setLocation('/results');
  };

  const ptPoss = pred.possessionPortugal;
  const esPoss = 100 - ptPoss;

  return (
    <div className="page" style={{ paddingTop: 0, maxWidth: 520, margin: '0 auto' }}>
      <div className="app-bg" />

      {/* ── Match Header Card ─────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: 12 }}>
        {/* Green top stripe */}
        <div style={{
          height: 4,
          background: 'linear-gradient(90deg, #22c55e 0%, #3b82f6 100%)',
          borderRadius: '0 0 0 0',
        }} />

        <div style={{
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          borderRight: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          borderRadius: '0 0 18px 18px',
          padding: '14px 20px 18px',
        }}>
          {/* Competition + badge row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: 0.3 }}>
              UEFA Nations League Final
            </p>
            <span className="live-badge"><span className="live-dot" />LIVE</span>
          </div>

          {/* Teams row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            {/* Portugal */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                <FlagImg code="pt" name="Portugal" size={50} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: 0.5 }}>PORTUGAL</div>
              <div style={{ display: 'flex', gap: 3, marginTop: 7, justifyContent: 'center' }}>
                {FORM_PORTUGAL.map((f, i) => (
                  <span key={i} className={`form-badge ${f}`}>{f}</span>
                ))}
              </div>
            </div>

            {/* Centre */}
            <div style={{ textAlign: 'center', flexShrink: 0, padding: '0 6px' }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                color: 'var(--text-dim)', marginBottom: 4,
              }}>VS</div>
              <div style={{
                fontSize: 10, color: 'var(--text-dim)', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                📍 usa
              </div>
            </div>

            {/* Spain */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                <FlagImg code="es" name="Spain" size={50} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: 0.5 }}>SPAIN</div>
              <div style={{ display: 'flex', gap: 3, marginTop: 7, justifyContent: 'center' }}>
                {FORM_SPAIN.map((f, i) => (
                  <span key={i} className={`form-badge ${f}`}>{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Match Stats ──────────────────────────────────── */}
      <div className="card" style={{ margin: '0 0 12px', padding: '18px 16px', position: 'relative', zIndex: 1 }}>
        <div className="section-header">
          <div className="section-accent" />
          Your Stats Prediction
          <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700, marginLeft: 'auto' }}>LIVE</span>
        </div>

        {/* Team labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingLeft: 4, paddingRight: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: 0.4 }}>🇵🇹 POR</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: 0.4 }}>ESP 🇪🇸</span>
        </div>

        {/* Possession slider */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>{ptPoss}<span style={{ fontSize: 14, fontWeight: 600 }}>%</span></span>
            <span style={{ fontWeight: 600, fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Ball Possession</span>
            <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{esPoss}<span style={{ fontSize: 14, fontWeight: 600 }}>%</span></span>
          </div>
          <div
            ref={trackRef}
            className="possession-track"
            onClick={handleTrackClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            <div
              className="possession-handle"
              style={{ left: `${ptPoss}%` }}
              onMouseDown={handleDragStart}
            />
          </div>
          <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-dim)', marginTop: 6, letterSpacing: 0.3 }}>
            Drag to adjust
          </p>
        </div>

        <div className="divider" style={{ margin: '0 0 16px' }} />

        <StatRow
          label="Shots on Target"
          iconLeft={<BallIcon />} iconRight={<BallIcon />}
          valLeft={pred.shotsPortugal} valRight={pred.shotsSpain} maxVal={20}
          onChangeLeft={v => set('shotsPortugal', v)} onChangeRight={v => set('shotsSpain', v)}
          barColorLeft="var(--primary)" barColorRight="var(--stat-blue)"
        />
        <StatRow
          label="Corners"
          iconLeft={<CornerIcon />} iconRight={<CornerIcon />}
          valLeft={pred.cornersPortugal} valRight={pred.cornersSpain} maxVal={20}
          onChangeLeft={v => set('cornersPortugal', v)} onChangeRight={v => set('cornersSpain', v)}
          barColorLeft="var(--primary)" barColorRight="var(--stat-blue)"
        />
        <StatRow
          label="Yellow Cards"
          iconLeft={<YellowCard />} iconRight={<YellowCard />}
          valLeft={pred.yellowCardsPortugal} valRight={pred.yellowCardsSpain} maxVal={11}
          onChangeLeft={v => set('yellowCardsPortugal', v)} onChangeRight={v => set('yellowCardsSpain', v)}
          barColorLeft="#f59e0b" barColorRight="#f59e0b"
        />
        <StatRow
          label="Red Cards"
          iconLeft={<RedCard />} iconRight={<RedCard />}
          valLeft={pred.redCardsPortugal} valRight={pred.redCardsSpain} maxVal={11}
          onChangeLeft={v => set('redCardsPortugal', v)} onChangeRight={v => set('redCardsSpain', v)}
          barColorLeft="var(--live)" barColorRight="var(--live)"
        />
      </div>

      {/* ── Match Prediction ─────────────────────────────── */}
      <div className="card" style={{ margin: '0 0 12px', padding: '18px 16px', position: 'relative', zIndex: 1 }}>
        <div className="section-header">
          <div className="section-accent" style={{ background: 'var(--accent)' }} />
          Match Prediction
        </div>

        {/* Score + BTTS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {/* Score spinners */}
          <div>
            <FieldLabel>Final Score</FieldLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 9, color: 'var(--text-dim)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>POR</p>
                <Counter val={pred.scorePortugal} onChange={v => set('scorePortugal', v)} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-dim)', paddingTop: 20 }}>:</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 9, color: 'var(--text-dim)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>ESP</p>
                <Counter val={pred.scoreSpain} onChange={v => set('scoreSpain', v)} />
              </div>
            </div>
          </div>

          {/* BTTS */}
          <div>
            <FieldLabel>Both Teams Score?</FieldLabel>
            <div className="toggle-group" style={{ flexDirection: 'column', gap: 7 }}>
              <button type="button"
                className={`toggle-btn ${pred.bothTeamsScore === 'yes' ? 'active' : ''}`}
                onClick={() => set('bothTeamsScore', 'yes')}>✓ Yes</button>
              <button type="button"
                className={`toggle-btn ${pred.bothTeamsScore === 'no' ? 'active-danger' : ''}`}
                onClick={() => set('bothTeamsScore', 'no')}>✕ No</button>
            </div>
          </div>
        </div>

        {/* Who will win */}
        <div style={{ marginBottom: 16 }}>
          <FieldLabel>Who Will Win?</FieldLabel>
          <div className="winner-group">
            {(['Portugal', 'Draw', 'Spain'] as const).map((opt, i) => {
              const odds = ['2.45', '3.10', '2.80'][i];
              return (
                <button key={opt} type="button"
                  className={`winner-btn ${pred.winner === opt ? 'active' : ''}`}
                  onClick={() => set('winner', opt)}>
                  {opt}
                  <span className="odds">{odds}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Total goals + Man of Match */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <FieldLabel>Total Goals</FieldLabel>
            <div className="toggle-group" style={{ flexDirection: 'column', gap: 7 }}>
              <button type="button"
                className={`toggle-btn ${pred.totalGoals === 'over' ? 'active' : ''}`}
                onClick={() => set('totalGoals', 'over')}>
                <span style={{ display: 'block' }}>Over 2</span>
                <span style={{ fontSize: 10, color: pred.totalGoals === 'over' ? 'rgba(255,255,255,0.75)' : 'var(--odds-color)', fontWeight: 600 }}>1.85</span>
              </button>
              <button type="button"
                className={`toggle-btn ${pred.totalGoals === 'under' ? 'active' : ''}`}
                onClick={() => set('totalGoals', 'under')}>
                <span style={{ display: 'block' }}>Under 2</span>
                <span style={{ fontSize: 10, color: pred.totalGoals === 'under' ? 'rgba(255,255,255,0.75)' : 'var(--odds-color)', fontWeight: 600 }}>1.95</span>
              </button>
            </div>
          </div>

          <div>
            <FieldLabel>Man of the Match</FieldLabel>
            <div className="sel-wrap">
              <select value={pred.manOfMatch} onChange={e => set('manOfMatch', e.target.value)}>
                <option>-- Select Player --</option>
                <optgroup label="🇵🇹 Portugal">
                  {PORTUGAL_PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}
                </optgroup>
                <optgroup label="🇪🇸 Spain">
                  {SPAIN_PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}
                </optgroup>
              </select>
              <span className="sel-arrow">▾</span>
            </div>
          </div>
        </div>

        {/* First goalscorer + Ronaldo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <FieldLabel>First Goalscorer</FieldLabel>
            <div className="sel-wrap">
              <select value={pred.firstGoalscorer} onChange={e => set('firstGoalscorer', e.target.value)}>
                <option>-- Select Player --</option>
                <optgroup label="🇵🇹 Portugal">
                  {PORTUGAL_PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}
                </optgroup>
                <optgroup label="🇪🇸 Spain">
                  {SPAIN_PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}
                </optgroup>
              </select>
              <span className="sel-arrow">▾</span>
            </div>
          </div>

          <div>
            <FieldLabel>Will Ronaldo Score?</FieldLabel>
            <div className="toggle-group" style={{ flexDirection: 'column', gap: 7 }}>
              <button type="button"
                className={`toggle-btn ${pred.ronaldoScores === 'yes' ? 'active' : ''}`}
                onClick={() => set('ronaldoScores', 'yes')}>✓ Yes</button>
              <button type="button"
                className={`toggle-btn ${pred.ronaldoScores === 'no' ? 'active-danger' : ''}`}
                onClick={() => set('ronaldoScores', 'no')}>✕ No</button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)',
            borderRadius: 10, padding: '11px 14px', marginBottom: 4,
            fontSize: 13, color: '#fca5a5', fontWeight: 500,
          }}>⚠ {error}</div>
        )}
      </div>

      {/* ── Submit ─────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 10, alignItems: 'center', marginBottom: 28 }}>
        <button
          type="button"
          onClick={handleSubmit}
          className="btn btn-primary"
          style={{ flex: 1, padding: '15px', fontSize: 15 }}
        >
          Submit Prediction →
        </button>
        <button
          type="button"
          onClick={() => setPred(DEFAULT)}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, color: 'var(--text-muted)',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', padding: '15px 14px', transition: 'all 0.18s',
          }}
        >↺ Reset</button>
      </div>

      {/* ── Back ──────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, paddingBottom: 16 }}>
        <button onClick={() => setLocation('/matches')} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3,
        }}>← Back to Matches</button>
      </div>
    </div>
  );
}
