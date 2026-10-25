import { cloneBoard, collides, place, clearLines } from '@/engine/board';
import type { Config } from '@/engine/config';
import { totalHeight } from '@/engine/config';
import { spawnX, spawnY, wrapRotation } from '@/engine/pieces';
import type { GameState, PieceType, Rotation } from '@/engine/types';

import { evaluateBoard, type Weights } from './evaluate';

export interface Placement {
  type: PieceType;
  x: number;
  y: number;
  rot: Rotation;
  hold: boolean;
  score: number;
}

const MOVES: Array<{ dx: number; drot: 0 | 1 | -1 | 2 }> = [
  { dx: -1, drot: 0 },
  { dx: 1, drot: 0 },
  { dx: 0, drot: 1 },
  { dx: 0, drot: -1 },
  { dx: 0, drot: 2 },
];

function dropY(
  board: Uint8Array,
  width: number,
  height: number,
  type: PieceType,
  x: number,
  y: number,
  rot: Rotation,
): number | null {
  if (collides(board, width, height, type, x, y, rot)) return null;
  let ny = y;
  while (!collides(board, width, height, type, x, ny + 1, rot)) ny += 1;
  return ny;
}

export function reachablePlacements(
  board: Uint8Array,
  cfg: Config,
  type: PieceType,
): Array<{ x: number; y: number; rot: Rotation }> {
  const height = totalHeight(cfg);
  const width = cfg.board.width;
  const sx = spawnX(type, width);
  const sy = spawnY(cfg.board.bufferHeight);
  const seen = new Set<string>();
  const q: Array<{ x: number; y: number; rot: Rotation }> = [
    { x: sx, y: sy, rot: 0 },
  ];
  const found: Array<{ x: number; y: number; rot: Rotation }> = [];
  const land = new Set<string>();
  seen.add(`0,${sx},${sy}`);
  let i = 0;
  while (i < q.length) {
    const cur = q[i];
    i += 1;
    if (!cur) continue;
    const gy = dropY(board, width, height, type, cur.x, cur.y, cur.rot);
    if (gy !== null) {
      const lk = `${cur.rot},${cur.x},${gy}`;
      if (!land.has(lk)) {
        land.add(lk);
        found.push({ x: cur.x, y: gy, rot: cur.rot });
      }
    }
    for (const move of MOVES) {
      const rot = wrapRotation(cur.rot + move.drot);
      const x = cur.x + move.dx;
      if (collides(board, width, height, type, x, cur.y, rot)) continue;
      const k = `${rot},${x},${cur.y}`;
      if (seen.has(k)) continue;
      seen.add(k);
      q.push({ x, y: cur.y, rot });
    }
  }
  return found;
}

function scorePlacement(
  board: Uint8Array,
  cfg: Config,
  type: PieceType,
  x: number,
  y: number,
  rot: Rotation,
  weights: Weights,
): { score: number; lines: number; next: Uint8Array } {
  const next = cloneBoard(board);
  place(next, cfg.board.width, {
    type,
    x,
    y,
    rot,
    lastAction: 'drop',
    lastKick: 0,
    lockFrames: 0,
    resets: 0,
  });
  const rows = clearLines(next, cfg.board.width, totalHeight(cfg));
  return {
    score: evaluateBoard(next, cfg, rows.length, weights),
    lines: rows.length,
    next,
  };
}

export function choosePlacement(
  state: GameState,
  cfg: Config,
  weights: Weights,
  lookahead = 0,
): Placement | null {
  if (!state.active) return null;
  const current = state.active.type;
  const options: Array<{
    type: PieceType;
    hold: boolean;
    x: number;
    y: number;
    rot: Rotation;
  }> = [];
  for (const p of reachablePlacements(state.board, cfg, current)) {
    options.push({ type: current, hold: false, ...p });
  }
  if (cfg.pieces.holdEnabled) {
    const held = state.hold ?? state.queue[0];
    if (held && held !== current) {
      for (const p of reachablePlacements(state.board, cfg, held)) {
        options.push({ type: held, hold: true, ...p });
      }
    }
  }
  let best: Placement | null = null;
  const nextType = state.queue[0];
  for (const opt of options) {
    const placed = scorePlacement(
      state.board,
      cfg,
      opt.type,
      opt.x,
      opt.y,
      opt.rot,
      weights,
    );
    let score = placed.score;
    if (lookahead > 0 && nextType && !opt.hold) {
      const child = reachablePlacements(placed.next, cfg, nextType);
      let childBest = Number.NEGATIVE_INFINITY;
      for (const c of child) {
        const cs = scorePlacement(
          placed.next,
          cfg,
          nextType,
          c.x,
          c.y,
          c.rot,
          weights,
        ).score;
        if (cs > childBest) childBest = cs;
      }
      if (Number.isFinite(childBest)) score += childBest * 0.35;
    }
    if (!best || score > best.score) {
      best = { ...opt, score };
    }
  }
  return best;
}
