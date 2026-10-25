import { describe, expect, it } from 'vitest';

import { readJson, readPb, writeJson, writePbIfBetter } from '@/storage/local';

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

describe('storage', () => {
  it('resets corrupt JSON instead of throwing', () => {
    const store = new MemoryStore();
    store.setItem('lb:v1:bad', '{not json');
    expect(readJson('lb:v1:bad', { ok: true }, store)).toEqual({ ok: true });
  });

  it('keeps a personal best and reports the delta', () => {
    const store = new MemoryStore();
    writeJson(
      'lb:v1:pb:marathon:w10',
      { score: 100, lines: 4, frames: 60 },
      store,
    );
    const first = writePbIfBetter(
      'lb:v1:pb:marathon:w10',
      { score: 250, lines: 8, frames: 90 },
      store,
    );
    expect(first.isNew).toBe(true);
    expect(first.delta).toBe(150);
    const held = writePbIfBetter(
      'lb:v1:pb:marathon:w10',
      { score: 120, lines: 5, frames: 70 },
      store,
    );
    expect(held.isNew).toBe(false);
    expect(readPb('lb:v1:pb:marathon:w10', store)?.score).toBe(250);
  });
});
