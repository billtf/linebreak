import type { Config } from './config';
import { msToFrames } from './config';
import type { HandlingState } from './types';
import { Input } from './types';

export function createHandling(): HandlingState {
  return { dir: 0, dasFrames: 0, arrFrames: 0, prevHeld: 0, dcdFrames: 0 };
}

function heldDir(held: number): -1 | 0 | 1 {
  const left = (held & Input.Left) !== 0;
  const right = (held & Input.Right) !== 0;
  if (left && !right) return -1;
  if (right && !left) return 1;
  return 0;
}

export function onRotate(handling: HandlingState, cfg: Config): void {
  handling.dcdFrames = msToFrames(cfg.handling.dcdMs, cfg.timing.tickHz);
}

/**
 * Convert the held bitmask into horizontal cell shifts for this frame.
 * Instant ARR (0 ms) walks to the wall in one tick (caller repeats until blocked).
 */
export function tickHandling(
  handling: HandlingState,
  held: number,
  cfg: Config,
): { dir: -1 | 0 | 1; count: number; instant: boolean } {
  const das = msToFrames(cfg.handling.dasMs, cfg.timing.tickHz);
  const arr = msToFrames(cfg.handling.arrMs, cfg.timing.tickHz);
  const dir = heldDir(held);
  const prevDir = handling.dir;
  const justChanged = dir !== 0 && dir !== prevDir;

  handling.dir = dir;

  if (dir === 0) {
    handling.dasFrames = 0;
    handling.arrFrames = 0;
    if (handling.dcdFrames > 0) handling.dcdFrames -= 1;
    return { dir: 0, count: 0, instant: false };
  }

  if (justChanged) {
    handling.dasFrames = 0;
    handling.arrFrames = 0;
    return { dir, count: 1, instant: false };
  }

  if (handling.dcdFrames > 0) {
    handling.dcdFrames -= 1;
    handling.dasFrames = 0;
    handling.arrFrames = 0;
    return { dir, count: 0, instant: false };
  }

  handling.dasFrames += 1;
  if (handling.dasFrames < das) {
    return { dir, count: 0, instant: false };
  }

  if (arr === 0) {
    return { dir, count: 1, instant: true };
  }

  const sinceDas = handling.dasFrames - das;
  if (sinceDas % arr === 0) {
    return { dir, count: 1, instant: false };
  }
  return { dir, count: 0, instant: false };
}

export function wasPressed(held: number, prev: number, bit: number): boolean {
  return (held & bit) !== 0 && (prev & bit) === 0;
}
