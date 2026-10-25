import { readJson, writeJson } from './local';

const KEY = 'lb:v1:puzzles';

export type PuzzleStars = Record<string, number>;

export function loadPuzzleStars(store: Storage = localStorage): PuzzleStars {
  const raw = readJson<PuzzleStars>(KEY, {}, store);
  return raw && typeof raw === 'object' ? raw : {};
}

export function savePuzzleStars(
  stars: PuzzleStars,
  store: Storage = localStorage,
): void {
  writeJson(KEY, stars, store);
}

export function recordPuzzleStars(
  id: string,
  earned: number,
  store: Storage = localStorage,
): PuzzleStars {
  const current = loadPuzzleStars(store);
  const prev = current[id] ?? 0;
  if (earned > prev) current[id] = earned;
  savePuzzleStars(current, store);
  return current;
}

export function tierStars(
  stars: PuzzleStars,
  tier: number,
  ids: string[],
): number {
  return ids
    .filter((id) => id.startsWith(`t${tier}-`))
    .reduce((sum, id) => sum + (stars[id] ?? 0), 0);
}

export function tierUnlocked(
  stars: PuzzleStars,
  tier: number,
  ids: string[],
): boolean {
  if (tier <= 1) return true;
  return tierStars(stars, tier - 1, ids) >= 10;
}
