import { readJson, writeJson } from './local';

export interface GameRecord {
  at: number;
  mode: string;
  width: number;
  score: number;
  lines: number;
  frames: number;
  pps: number;
  finesse: number;
  clears: Record<string, number>;
  tags: string[];
}

const KEY = 'lb:v1:history';
const MAX = 500;

export function loadHistory(store: Storage = localStorage): GameRecord[] {
  const raw = readJson<GameRecord[]>(KEY, [], store);
  return Array.isArray(raw) ? raw : [];
}

export function appendHistory(
  record: GameRecord,
  store: Storage = localStorage,
): GameRecord[] {
  const next = [...loadHistory(store), record];
  while (next.length > MAX) next.shift();
  writeJson(KEY, next, store);
  return next;
}

export function clearHistory(store: Storage = localStorage): void {
  writeJson(KEY, [], store);
}

export function summarize(records: GameRecord[]): {
  games: number;
  avgPps: number;
  avgScore: number;
  clears: Record<string, number>;
} {
  const clears: Record<string, number> = {};
  let pps = 0;
  let score = 0;
  for (const rec of records) {
    pps += rec.pps;
    score += rec.score;
    for (const [kind, n] of Object.entries(rec.clears)) {
      clears[kind] = (clears[kind] ?? 0) + n;
    }
  }
  const games = records.length;
  return {
    games,
    avgPps: games ? pps / games : 0,
    avgScore: games ? score / games : 0,
    clears,
  };
}

export function lastN(records: GameRecord[], n: number): GameRecord[] {
  return records.slice(-n);
}
