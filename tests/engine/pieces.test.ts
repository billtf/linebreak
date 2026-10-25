import { describe, expect, it } from 'vitest';

import { pieceBounds, spawnX, spawnY } from '@/engine/pieces';
import type { PieceType } from '@/engine/types';

describe('spawn columns', () => {
  const cases: Array<[PieceType, number, number]> = [
    ['I', 6, 1],
    ['I', 10, 3],
    ['I', 16, 6],
    ['T', 6, 1],
    ['T', 10, 3],
    ['T', 16, 6],
    ['O', 6, 1],
    ['O', 10, 3],
    ['O', 16, 6],
  ];

  it.each(cases)('%s on width %i spawns at x=%i', (type, width, expected) => {
    expect(spawnX(type, width)).toBe(expected);
  });

  it('uses floor((width − pieceWidth) / 2) − minX', () => {
    for (const type of ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const) {
      const { minX, width: pw } = pieceBounds(type, 0);
      expect(spawnX(type, 10)).toBe(Math.floor((10 - pw) / 2) - minX);
    }
  });

  it('spawns two rows above the visible top', () => {
    expect(spawnY(20)).toBe(18);
  });
});
