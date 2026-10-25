import { getCell } from '@/engine/board';
import type { Config } from '@/engine/config';
import { totalHeight, visibleTop } from '@/engine/config';

export interface Weights {
  height: number;
  holes: number;
  bumpiness: number;
  well: number;
  lines: number;
  tSlot: number;
}

export const DEFAULT_WEIGHTS: Weights = {
  height: -0.55,
  holes: -3.8,
  bumpiness: -0.18,
  well: 0.25,
  lines: 1.6,
  tSlot: 1.1,
};

export function columnHeights(
  board: Uint8Array,
  width: number,
  height: number,
  top: number,
): number[] {
  const out: number[] = [];
  for (let x = 0; x < width; x++) {
    let h = 0;
    for (let y = top; y < height; y++) {
      if (getCell(board, width, x, y) !== 0) {
        h = height - y;
        break;
      }
    }
    out.push(h);
  }
  return out;
}

export function countHoles(
  board: Uint8Array,
  width: number,
  height: number,
  top: number,
): number {
  let holes = 0;
  for (let x = 0; x < width; x++) {
    let seen = false;
    for (let y = top; y < height; y++) {
      const filled = getCell(board, width, x, y) !== 0;
      if (filled) seen = true;
      else if (seen) holes += 1;
    }
  }
  return holes;
}

export function bumpiness(heights: number[]): number {
  let sum = 0;
  for (let i = 1; i < heights.length; i++) {
    sum += Math.abs((heights[i] ?? 0) - (heights[i - 1] ?? 0));
  }
  return sum;
}

export function wellDepth(heights: number[]): number {
  let best = 0;
  for (let i = 0; i < heights.length; i++) {
    const left = i === 0 ? 99 : (heights[i - 1] ?? 0);
    const right = i === heights.length - 1 ? 99 : (heights[i + 1] ?? 0);
    const mid = heights[i] ?? 0;
    const wall = Math.min(left, right) - mid;
    if (wall > best) best = wall;
  }
  return best;
}

/** Crude T-spin double cavity: a 3-wide notch one cell deep. */
export function tSlotScore(
  board: Uint8Array,
  width: number,
  height: number,
): number {
  let score = 0;
  for (let y = 1; y < height; y++) {
    for (let x = 1; x < width - 1; x++) {
      const mid = getCell(board, width, x, y) === 0;
      const left = getCell(board, width, x - 1, y) !== 0;
      const right = getCell(board, width, x + 1, y) !== 0;
      const below = y + 1 >= height || getCell(board, width, x, y + 1) !== 0;
      if (mid && left && right && below) score += 1;
    }
  }
  return score;
}

export function evaluateBoard(
  board: Uint8Array,
  cfg: Config,
  linesCleared: number,
  weights: Weights = DEFAULT_WEIGHTS,
): number {
  const height = totalHeight(cfg);
  const top = visibleTop(cfg);
  const heights = columnHeights(board, cfg.board.width, height, top);
  const agg = heights.reduce((a, b) => a + b, 0);
  return (
    weights.height * agg +
    weights.holes * countHoles(board, cfg.board.width, height, top) +
    weights.bumpiness * bumpiness(heights) +
    weights.well * wellDepth(heights) +
    weights.lines * linesCleared +
    weights.tSlot * tSlotScore(board, cfg.board.width, height)
  );
}
