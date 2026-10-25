import { describe, expect, it } from 'vitest';

import {
  clearLines,
  collides,
  createBoard,
  isEmpty,
  place,
  setCell,
} from '@/engine/board';
import { DEFAULT_CONFIG, totalHeight } from '@/engine/config';
import { paintVisible, piece } from './helpers';

describe('board', () => {
  it('creates an empty board', () => {
    const board = createBoard(DEFAULT_CONFIG);
    expect(board.length).toBe(10 * 40);
    expect(isEmpty(board)).toBe(true);
  });

  it('detects collisions with walls, floor, and blocks', () => {
    const { board, cfg } = paintVisible(['..........', 'XXXX......']);
    const h = totalHeight(cfg);
    expect(collides(board, 10, h, 'O', -1, 20, 0)).toBe(true);
    expect(collides(board, 10, h, 'O', 8, 20, 0)).toBe(true);
    expect(collides(board, 10, h, 'O', 3, 39, 0)).toBe(true);
    expect(collides(board, 10, h, 'O', 0, 20, 0)).toBe(true);
    expect(collides(board, 10, h, 'O', 4, 20, 0)).toBe(false);
  });

  it('places a piece and clears 1 to 4 lines including non-adjacent rows', () => {
    const cfg = DEFAULT_CONFIG;
    const board = createBoard(cfg);
    const w = 10;
    const h = totalHeight(cfg);
    const bottom = h - 1;
    const fillRow = (y: number) => {
      for (let x = 0; x < w; x++) setCell(board, w, x, y, 1);
    };
    fillRow(bottom);
    fillRow(bottom - 2);
    fillRow(bottom - 3);
    fillRow(bottom - 5);
    const cleared = clearLines(board, w, h);
    expect(cleared).toEqual([bottom - 5, bottom - 3, bottom - 2, bottom]);
    expect(isEmpty(board)).toBe(true);
  });

  it('keeps uncleared rows after a clear', () => {
    const { board, cfg } = paintVisible([
      '..........',
      'XXXXXX....',
      'XXXXXXXXXX',
      'XXXXXX....',
      'XXXXXXXXXX',
    ]);
    const h = totalHeight(cfg);
    const cleared = clearLines(board, 10, h);
    expect(cleared).toHaveLength(2);
    expect(isEmpty(board)).toBe(false);
  });

  it('place writes piece ids', () => {
    const board = createBoard(DEFAULT_CONFIG);
    const cells = place(board, 10, piece('T', 3, 20));
    expect(cells).toHaveLength(4);
    expect(isEmpty(board)).toBe(false);
  });
});
