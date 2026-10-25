import { describe, expect, it } from 'vitest';

import { DEFAULT_CONFIG, loadConfig, parseConfig } from '@/engine/config';

describe('config', () => {
  it('parses the default config', () => {
    expect(parseConfig(DEFAULT_CONFIG).board.width).toBe(10);
  });

  it('deep-merges mode overrides', () => {
    const c = loadConfig({ board: { width: 12 }, pieces: { previewCount: 3 } });
    expect(c.board.width).toBe(12);
    expect(c.board.visibleHeight).toBe(20);
    expect(c.pieces.previewCount).toBe(3);
    expect(c.pieces.holdEnabled).toBe(true);
  });

  it('rejects width 5 with a clear message', () => {
    expect(() => loadConfig({ board: { width: 5 } })).toThrow(/width/i);
  });

  it('rejects an unknown key', () => {
    expect(() => loadConfig({ nope: true })).toThrow(
      /unrecognized|nope|invalid/i,
    );
  });

  it('rejects an unknown nested key', () => {
    expect(() => loadConfig({ board: { width: 10, extra: 1 } })).toThrow(
      /unrecognized|extra|invalid/i,
    );
  });
});
