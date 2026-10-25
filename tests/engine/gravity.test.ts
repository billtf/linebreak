import { describe, expect, it } from 'vitest';

import { DEFAULT_CONFIG } from '@/engine/config';
import {
  cellsPerFrame,
  gravityThisTick,
  secondsPerRow,
} from '@/engine/gravity';

describe('gravity', () => {
  it('drops 1 row per 60 ticks at level 1', () => {
    expect(secondsPerRow(1)).toBe(1);
    expect(cellsPerFrame(1, DEFAULT_CONFIG)).toBeCloseTo(1 / 60, 8);
    let acc = 0;
    let rows = 0;
    for (let i = 0; i < 60; i++) {
      acc += cellsPerFrame(1, DEFAULT_CONFIG);
      while (acc >= 1) {
        acc -= 1;
        rows += 1;
      }
    }
    expect(rows).toBe(1);
  });

  it('is 20G from level 20', () => {
    expect(cellsPerFrame(20, DEFAULT_CONFIG)).toBe(20);
    expect(cellsPerFrame(99, DEFAULT_CONFIG)).toBe(20);
  });

  it('soft drop multiplies gravity', () => {
    expect(gravityThisTick(1, DEFAULT_CONFIG, true)).toBeCloseTo(
      (1 / 60) * 20,
      8,
    );
  });
});
