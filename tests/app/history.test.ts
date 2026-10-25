import { describe, expect, it } from 'vitest';

import {
  appendHistory,
  lastN,
  loadHistory,
  summarize,
  type GameRecord,
} from '@/storage/history';
import { recordPuzzleStars, tierUnlocked } from '@/storage/puzzles';

class MemoryStore implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

function rec(n: number): GameRecord {
  return {
    at: n,
    mode: 'marathon',
    width: 10,
    score: n * 10,
    lines: n,
    frames: 60,
    pps: 1,
    finesse: 0,
    clears: { single: 1 },
    tags: [],
  };
}

describe('history', () => {
  it('caps at 500 and summarizes quickly', () => {
    const store = new MemoryStore();
    for (let i = 0; i < 520; i++) appendHistory(rec(i), store);
    const all = loadHistory(store);
    expect(all).toHaveLength(500);
    const t0 = performance.now();
    summarize(all);
    lastN(all, 30);
    expect(performance.now() - t0).toBeLessThan(100);
    expect(summarize(all).games).toBe(500);
  });
});

describe('puzzle unlocks', () => {
  it('locks tier 2 until 10 stars', () => {
    const store = new MemoryStore();
    const ids = ['t1-01', 't1-02', 't1-03', 't1-04', 't1-05', 't2-01'];
    recordPuzzleStars('t1-01', 3, store);
    expect(tierUnlocked(recordPuzzleStars('t1-02', 3, store), 2, ids)).toBe(
      false,
    );
    recordPuzzleStars('t1-03', 3, store);
    const stars = recordPuzzleStars('t1-04', 3, store);
    expect(tierUnlocked(stars, 2, ids)).toBe(true);
  });
});
