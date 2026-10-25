import { describe, expect, it } from 'vitest';

import { exportSave, importSave, resetSave } from '@/storage/data';

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

describe('save data', () => {
  it('exports and imports versioned keys', () => {
    const a = new MemoryStore();
    a.setItem('lb:v1:pb:marathon:w10', '{"score":9}');
    a.setItem('other', 'skip');
    const json = exportSave(a);
    const b = new MemoryStore();
    importSave(json, b);
    expect(b.getItem('lb:v1:pb:marathon:w10')).toBe('{"score":9}');
    expect(b.getItem('other')).toBeNull();
    resetSave(b);
    expect(b.getItem('lb:v1:pb:marathon:w10')).toBeNull();
  });
});
