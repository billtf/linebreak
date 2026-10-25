import { describe, expect, it } from 'vitest';

import { DEFAULT_CONFIG } from '@/engine/config';
import { scoreClear } from '@/engine/scoring';
import type { ClearKind } from '@/engine/types';

describe('scoring table', () => {
  const rows: Array<[ClearKind, number, number]> = [
    ['single', 1, 100],
    ['double', 2, 300],
    ['triple', 3, 500],
    ['quad', 4, 800],
    ['tspinMini', 0, 100],
    ['tspin', 0, 400],
    ['tspinSingle', 1, 800],
    ['tspinDouble', 2, 1200],
    ['tspinTriple', 3, 1600],
  ];

  it.each(rows)('%s is %i × level', (kind, lines, base) => {
    const result = scoreClear(
      {
        kind,
        lines,
        combo: 1,
        backToBack: false,
        perfect: false,
        level: 3,
      },
      DEFAULT_CONFIG,
    );
    expect(result.points).toBe(base * 3);
  });

  it('applies back-to-back × 1.5 on a quad', () => {
    const result = scoreClear(
      {
        kind: 'quad',
        lines: 4,
        combo: 1,
        backToBack: true,
        perfect: false,
        level: 1,
      },
      DEFAULT_CONFIG,
    );
    expect(result.points).toBe(800 * 1.5);
    expect(result.b2bAwarded).toBe(true);
  });

  it('adds combo points for consecutive clears', () => {
    const result = scoreClear(
      {
        kind: 'single',
        lines: 1,
        combo: 3,
        backToBack: false,
        perfect: false,
        level: 1,
      },
      DEFAULT_CONFIG,
    );
    expect(result.points).toBe(100 + 50 * 2);
  });

  it('adds perfect-clear bonus by line count', () => {
    const pc4 = scoreClear(
      {
        kind: 'quad',
        lines: 4,
        combo: 1,
        backToBack: false,
        perfect: true,
        level: 1,
      },
      DEFAULT_CONFIG,
    );
    expect(pc4.points).toBe(800 + 3200);
    expect(pc4.kind).toBe('perfectClear');
  });
});
