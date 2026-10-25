export function storageGet(
  key: string,
  store: Storage = localStorage,
): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

export function storageSet(
  key: string,
  value: string,
  store: Storage = localStorage,
): void {
  try {
    store.setItem(key, value);
  } catch {
    // private mode / quota — ignore
  }
}

export function readJson<T>(
  key: string,
  fallback: T,
  store: Storage = localStorage,
): T {
  const raw = storageGet(key, store);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(
  key: string,
  value: unknown,
  store: Storage = localStorage,
): void {
  try {
    storageSet(key, JSON.stringify(value), store);
  } catch {
    // ignore
  }
}

export interface PersonalBest {
  score: number;
  lines: number;
  frames: number;
}

export function readPb(
  key: string,
  store: Storage = localStorage,
): PersonalBest | null {
  const value = readJson<PersonalBest | null>(key, null, store);
  if (
    !value ||
    typeof value.score !== 'number' ||
    typeof value.lines !== 'number' ||
    typeof value.frames !== 'number'
  ) {
    return null;
  }
  return value;
}

export function writePbIfBetter(
  key: string,
  next: PersonalBest,
  store: Storage = localStorage,
): { pb: PersonalBest; delta: number; isNew: boolean } {
  const prev = readPb(key, store);
  if (!prev || next.score > prev.score) {
    writeJson(key, next, store);
    return { pb: next, delta: next.score - (prev?.score ?? 0), isNew: true };
  }
  return { pb: prev, delta: next.score - prev.score, isNew: false };
}
