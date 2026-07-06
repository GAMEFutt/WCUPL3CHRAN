export type Predictions = {
  // Score prediction
  scorePortugal: number;
  scoreSpain: number;
  // Match outcome
  winner: "Portugal" | "Spain" | "Draw" | "";
  totalGoals: "over" | "under" | "";
  bothTeamsScore: "yes" | "no" | "";
  // Player predictions
  manOfMatch: string;
  firstGoalscorer: string;
  ronaldoScores: "yes" | "no" | "";
  // Stats predictions
  possessionPortugal: number; // Portugal's % (Spain = 100 - this)
  shotsPortugal: number;
  shotsSpain: number;
  cornersPortugal: number;
  cornersSpain: number;
  yellowCardsPortugal: number;
  yellowCardsSpain: number;
  redCardsPortugal: number;
  redCardsSpain: number;
};

export type PlayerSubmission = {
  id: string;
  playerName: string;
  match: string;
  predictions: Predictions;
  timestamp: number;
  score: number;
  correctCount: number;
};

export type MatchResults = Partial<Predictions>;

const STORAGE_KEYS = {
  PLAYER: "football_player",
  SUBMISSIONS: "football_submissions",
  RESULTS: "football_results",
};

export function getCurrentPlayer(): string | null {
  return localStorage.getItem(STORAGE_KEYS.PLAYER);
}

export function setCurrentPlayer(name: string) {
  localStorage.setItem(STORAGE_KEYS.PLAYER, name);
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.PLAYER);
}

export function getSubmissions(): PlayerSubmission[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getSubmissionForPlayer(playerName: string): PlayerSubmission | null {
  const subs = getSubmissions();
  return subs.find((s) => s.playerName === playerName) || null;
}

export function getMatchResults(): MatchResults | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveMatchResults(results: MatchResults) {
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
  recalculateScores();
}

function scoreExact<T>(p: T, a: T | undefined): number {
  if (a === undefined || a === null || a === "") return 0;
  return p === a ? 1 : 0;
}

function scoreNumber(p: number, a: number | undefined): number {
  if (a === undefined || isNaN(a as number)) return 0;
  if (p === a) return 1;
  if (Math.abs(p - a) <= 1) return 0.5;
  return 0;
}

function scoreString(p: string, a: string | undefined): number {
  if (!a) return 0;
  return p.trim().toLowerCase() === a.trim().toLowerCase() ? 1 : 0;
}

function scorePossession(p: number, a: number | undefined): number {
  if (a === undefined) return 0;
  const diff = Math.abs(p - a);
  if (diff === 0) return 1;
  if (diff <= 5) return 0.75;
  if (diff <= 10) return 0.5;
  return 0;
}

export function calculateScore(
  prediction: Predictions,
  actual: MatchResults
): { score: number; correctCount: number } {
  const scores: number[] = [
    scoreNumber(prediction.scorePortugal, actual.scorePortugal),
    scoreNumber(prediction.scoreSpain, actual.scoreSpain),
    scoreExact(prediction.winner, actual.winner),
    scoreExact(prediction.totalGoals, actual.totalGoals),
    scoreExact(prediction.bothTeamsScore, actual.bothTeamsScore),
    scoreString(prediction.manOfMatch, actual.manOfMatch),
    scoreString(prediction.firstGoalscorer, actual.firstGoalscorer),
    scoreExact(prediction.ronaldoScores, actual.ronaldoScores),
    scorePossession(prediction.possessionPortugal, actual.possessionPortugal),
    scoreNumber(prediction.shotsPortugal, actual.shotsPortugal),
    scoreNumber(prediction.shotsSpain, actual.shotsSpain),
    scoreNumber(prediction.cornersPortugal, actual.cornersPortugal),
    scoreNumber(prediction.cornersSpain, actual.cornersSpain),
    scoreExact(prediction.yellowCardsPortugal, actual.yellowCardsPortugal),
    scoreExact(prediction.yellowCardsSpain, actual.yellowCardsSpain),
    scoreExact(prediction.redCardsPortugal, actual.redCardsPortugal),
    scoreExact(prediction.redCardsSpain, actual.redCardsSpain),
  ];

  const score = scores.reduce((a, b) => a + b, 0);
  const correctCount = scores.filter((s) => s === 1).length;
  return { score, correctCount };
}

function recalculateScores() {
  const results = getMatchResults();
  if (!results) return;
  const submissions = getSubmissions();
  const updated = submissions.map((sub) => {
    const { score, correctCount } = calculateScore(sub.predictions, results);
    return { ...sub, score, correctCount };
  });
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));
}

export function saveSubmission(playerName: string, predictions: Predictions) {
  const submissions = getSubmissions();
  const results = getMatchResults();
  const { score, correctCount } = results
    ? calculateScore(predictions, results)
    : { score: 0, correctCount: 0 };

  const existing = submissions.findIndex((s) => s.playerName === playerName);
  const sub: PlayerSubmission = {
    id: existing >= 0 ? submissions[existing].id : crypto.randomUUID(),
    playerName,
    match: "Portugal vs Spain",
    predictions,
    timestamp: Date.now(),
    score,
    correctCount,
  };

  if (existing >= 0) {
    submissions[existing] = sub;
  } else {
    submissions.push(sub);
  }
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
}
