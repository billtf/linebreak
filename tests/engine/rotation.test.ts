import { describe, expect, it } from 'vitest';

import { createBoard } from '@/engine/board';
import { DEFAULT_CONFIG, totalHeight } from '@/engine/config';
import {
  SRS_I,
  SRS_I_180,
  SRS_JLSTZ,
  SRS_JLSTZ_180,
} from '@/engine/data/kicks';
import { applyKick, tryRotate } from '@/engine/rotation';
import { piece } from './helpers';

describe('SRS kicks', () => {
  it('matches published JLSTZ offsets', () => {
    expect(SRS_JLSTZ['0>1']).toEqual([
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ]);
    expect(SRS_JLSTZ['0>3']?.[0]).toEqual([0, 0]);
    expect(SRS_I['0>1']?.[1]).toEqual([-2, 0]);
    expect(SRS_JLSTZ_180['0>2']?.[0]).toEqual([0, 0]);
    expect(SRS_I_180['1>3']?.[0]).toEqual([0, 0]);
  });

  it('tries every kick in order until one fits', () => {
    const board = createBoard(DEFAULT_CONFIG);
    const h = totalHeight(DEFAULT_CONFIG);
    const t = piece('T', 4, 20, 0);
    const result = tryRotate(board, 10, h, t, 1);
    expect(result).not.toBeNull();
    expect(result?.kick).toBe(0);
    expect(result?.piece.rot).toBe(1);
  });

  it.each(Object.entries(SRS_JLSTZ))('JLSTZ %s has 5 tests', (_key, kicks) => {
    expect(kicks).toHaveLength(5);
  });

  it.each(Object.entries(SRS_I))('I %s has 5 tests', (_key, kicks) => {
    expect(kicks).toHaveLength(5);
  });

  it('applies guideline y+ up onto a y-down board', () => {
    expect(applyKick(5, 10, [1, 2])).toEqual({ x: 6, y: 8 });
  });

  it('uses a wall kick when (0,0) is blocked', () => {
    const board = createBoard(DEFAULT_CONFIG);
    const h = totalHeight(DEFAULT_CONFIG);
    const i = piece('I', 7, 18, 1);
    const result = tryRotate(board, 10, h, i, 1);
    expect(result).not.toBeNull();
    expect(result!.kick).toBeGreaterThan(0);
    expect(result!.piece.x + 3).toBeLessThan(10);
  });

  it('rotates I through all four states on an empty board', () => {
    const board = createBoard(DEFAULT_CONFIG);
    const h = totalHeight(DEFAULT_CONFIG);
    let p = piece('I', 3, 18, 0);
    for (const dest of [1, 2, 3, 0]) {
      const result = tryRotate(board, 10, h, p, 1);
      expect(result?.piece.rot).toBe(dest);
      p = result!.piece;
    }
  });

  it('returns null when every kick is blocked', () => {
    const board = createBoard(DEFAULT_CONFIG);
    board.fill(1);
    const h = totalHeight(DEFAULT_CONFIG);
    expect(tryRotate(board, 10, h, piece('T', 3, 20), 1)).toBeNull();
  });
});
