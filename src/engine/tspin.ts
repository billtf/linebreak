import { getCell } from './board';
import type { ActivePiece, ClearKind } from './types';

const CORNERS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [2, 0],
  [0, 2],
  [2, 2],
];

/** Front corners of the T 3×3, by rotation (facing direction). */
const FRONT: Record<0 | 1 | 2 | 3, ReadonlyArray<readonly [number, number]>> = {
  0: [
    [0, 0],
    [2, 0],
  ],
  1: [
    [2, 0],
    [2, 2],
  ],
  2: [
    [0, 2],
    [2, 2],
  ],
  3: [
    [0, 0],
    [0, 2],
  ],
};

function occupied(
  board: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
): boolean {
  if (x < 0 || x >= width || y < 0 || y >= height) return true;
  return getCell(board, width, x, y) !== 0;
}

export type SpinKind = 'none' | 'mini' | 'full';

/**
 * 3-corner T-spin rule. Mini vs full uses the two front corners.
 * The 5th SRS kick (index 4) upgrades a mini to a full.
 */
export function detectTSpin(
  board: Uint8Array,
  width: number,
  height: number,
  piece: ActivePiece,
): SpinKind {
  if (piece.type !== 'T' || piece.lastAction !== 'rotate') return 'none';
  let corners = 0;
  for (const [dx, dy] of CORNERS) {
    if (occupied(board, width, height, piece.x + dx, piece.y + dy))
      corners += 1;
  }
  if (corners < 3) return 'none';
  const front = FRONT[piece.rot];
  let frontFilled = 0;
  for (const [dx, dy] of front) {
    if (occupied(board, width, height, piece.x + dx, piece.y + dy))
      frontFilled += 1;
  }
  let kind: SpinKind = frontFilled >= 2 ? 'full' : 'mini';
  if (kind === 'mini' && piece.lastKick === 4) kind = 'full';
  return kind;
}

export function clearKindFor(lines: number, spin: SpinKind): ClearKind | null {
  if (lines === 0) {
    if (spin === 'mini') return 'tspinMini';
    if (spin === 'full') return 'tspin';
    return null;
  }
  if (spin === 'full' || spin === 'mini') {
    if (lines === 1) return 'tspinSingle';
    if (lines === 2) return 'tspinDouble';
    if (lines === 3) return 'tspinTriple';
  }
  if (lines === 1) return 'single';
  if (lines === 2) return 'double';
  if (lines === 3) return 'triple';
  if (lines === 4) return 'quad';
  return null;
}
