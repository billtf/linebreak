import { describe, expect, it } from 'vitest';

import {
  addGarbage,
  attackLines,
  cancelGarbage,
  createBoard,
  loadConfig,
} from '@/engine';
import { getCell } from '@/engine/board';
import { totalHeight } from '@/engine/config';

describe('garbage', () => {
  it('matches the spec attack table', () => {
    expect(attackLines('single', false, 1)).toBe(0);
    expect(attackLines('double', false, 1)).toBe(1);
    expect(attackLines('triple', false, 1)).toBe(2);
    expect(attackLines('quad', false, 1)).toBe(4);
    expect(attackLines('tspinDouble', false, 1)).toBe(4);
    expect(attackLines('tspinTriple', false, 1)).toBe(6);
    expect(attackLines('quad', true, 1)).toBe(5);
    expect(attackLines('double', false, 3)).toBe(3);
  });

  it('cancels incoming before sending', () => {
    expect(cancelGarbage(4, 2)).toEqual({ send: 2, leftoverIncoming: 0 });
    expect(cancelGarbage(1, 4)).toEqual({ send: 0, leftoverIncoming: 3 });
    expect(cancelGarbage(3, 3)).toEqual({ send: 0, leftoverIncoming: 0 });
  });

  it('inserts width-aware garbage with one hole per batch', () => {
    const cfg = loadConfig({ board: { width: 8 } });
    const board = createBoard(cfg);
    const h = totalHeight(cfg);
    addGarbage(board, 8, h, 2, 3);
    const bottom = h - 1;
    let holes = 0;
    for (let x = 0; x < 8; x++) {
      if (getCell(board, 8, x, bottom) === 0) holes += 1;
    }
    expect(holes).toBe(1);
    expect(getCell(board, 8, 3, bottom)).toBe(0);
  });
});
