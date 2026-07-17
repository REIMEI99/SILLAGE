import type {
  DashboardStats,
  GameRecord,
  GameState,
  TechniqueType,
} from '../types/game';

const RECORDS_ENDPOINT = '/api/session-records';

function sortRecords(records: GameRecord[]): GameRecord[] {
  return [...records].sort((a, b) => b.endedAt.localeCompare(a.endedAt));
}

function parseRecords(value: unknown): GameRecord[] {
  return Array.isArray(value) ? (value as GameRecord[]) : [];
}

export async function loadGameRecords(): Promise<GameRecord[]> {
  try {
    const response = await fetch(RECORDS_ENDPOINT, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Session records request failed.');
    return sortRecords(parseRecords(await response.json()));
  } catch {
    return [];
  }
}

export function createGameRecord(state: GameState, thought: string, endedAt: string): GameRecord {
  return {
    id: state.sessionId,
    startedAt: state.startedAt,
    endedAt,
    sessionId: state.sessionId,
    seed: state.seed,
    finalScore: state.score,
    thought: thought.trim(),
    initialSnapshot: state.initialSnapshot,
    finalState: state,
    events: state.events,
    deliveredOrders: state.deliveredOrders,
  };
}

function downloadRecords(records: GameRecord[]) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'sillage-v012-session-records.json';
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function saveGameRecord(record: GameRecord): Promise<GameRecord[]> {
  const current = await loadGameRecords();
  const records = [...current.filter((item) => item.id !== record.id), record];

  try {
    const response = await fetch(RECORDS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(records),
    });
    if (!response.ok) throw new Error('Session records save failed.');
    return sortRecords(parseRecords(await response.json()));
  } catch {
    downloadRecords(records);
    return sortRecords(records);
  }
}

export function getDashboardStats(records: GameRecord[]): DashboardStats {
  const techniqueCounts: Record<TechniqueType, number> = {
    INTENSE: 0,
    PURE: 0,
    LAYERED: 0,
  };
  const totalScore = records.reduce((sum, record) => sum + record.finalScore, 0);
  const totalOrders = records.reduce((sum, record) => sum + record.deliveredOrders.length, 0);
  const totalRounds = records.reduce((sum, record) => sum + (record.finalState.roundsCompleted ?? 0), 0);
  for (const record of records) {
    for (const order of record.deliveredOrders) {
      techniqueCounts[order.technique.type] += 1;
    }
  }
  return {
    gamesPlayed: records.length,
    totalScore,
    averageScore: records.length ? totalScore / records.length : 0,
    highScore: records.length ? Math.max(...records.map((record) => record.finalScore)) : 0,
    totalOrders,
    averageOrders: records.length ? totalOrders / records.length : 0,
    averageRounds: records.length ? totalRounds / records.length : 0,
    techniqueCounts,
  };
}
