import { collidesPiece } from './board';
import type { Config } from './config';
import { totalHeight } from './config';
import { cellsAt } from './pieces';
import type { ActivePiece, GameState } from './types';

export function isGrounded(state: GameState, cfg: Config): boolean {
  if (!state.active) return false;
  const shifted: ActivePiece = {
    ...state.active,
    y: state.active.y + 1,
  };
  return collidesPiece(state.board, state.width, totalHeight(cfg), shifted);
}

/** Increment lock frames; return true when the piece should lock. */
export function tickLock(state: GameState, cfg: Config): boolean {
  if (!state.active) return false;
  state.active.lockFrames += 1;
  return state.active.lockFrames >= cfg.timing.lockDelayFrames;
}

/**
 * Successful move/rotate while interacting with the ground.
 * 15 resets are allowed; the 16th forces a lock.
 */
export function applyLockReset(
  state: GameState,
  cfg: Config,
): 'reset' | 'lock' | 'none' {
  if (!state.active) return 'none';
  if (state.active.resets < cfg.timing.maxLockResets) {
    state.active.resets += 1;
    state.active.lockFrames = 0;
    return 'reset';
  }
  return 'lock';
}

/** True when every locked cell sits above the visible playfield (spec row 20). */
export function lockedAboveVisible(piece: ActivePiece, cfg: Config): boolean {
  const top = cfg.board.bufferHeight;
  return cellsAt(piece.type, piece.x, piece.y, piece.rot).every(
    ([, y]) => y < top,
  );
}
