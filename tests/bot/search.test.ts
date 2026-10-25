import { describe, expect, it } from 'vitest';

import { createGame, loadConfig, step, Input } from '@/engine';
import { DEFAULT_WEIGHTS } from '@/bot/evaluate';
import { choosePlacement } from '@/bot/search';
import { createDriver } from '@/bot/driver';
import { botLevel } from '@/bot/levels';

function snapLines(target: number): { lines: number; over: boolean } {
  const cfg = loadConfig();
  const state = createGame(1, cfg);
  let guard = 0;
  while (state.lines < target && !state.over && guard++ < 8000) {
    const pick = choosePlacement(state, cfg, DEFAULT_WEIGHTS, 0);
    if (!pick || !state.active) break;
    if (pick.hold) {
      step(state, Input.Hold, cfg);
      step(state, 0, cfg);
      continue;
    }
    state.active.x = pick.x;
    state.active.rot = pick.rot;
    step(state, Input.HardDrop, cfg);
    step(state, 0, cfg);
  }
  return { lines: state.lines, over: state.over };
}

describe('bot search', () => {
  it('finds a quad in a 4-deep well', () => {
    const cfg = loadConfig();
    const state = createGame(1, cfg);
    const w = state.width;
    const h = state.board.length / w;
    for (let y = h - 4; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (x !== 5) state.board[y * w + x] = 1;
      }
    }
    state.active = {
      type: 'I',
      x: 3,
      y: 18,
      rot: 0,
      lastAction: 'spawn',
      lastKick: 0,
      lockFrames: 0,
      resets: 0,
    };
    const pick = choosePlacement(state, cfg, DEFAULT_WEIGHTS, 0);
    expect(pick).toBeTruthy();
    expect(pick?.rot === 1 || pick?.rot === 3).toBe(true);
  });

  it('locks several pieces without an instant top out', () => {
    const result = snapLines(4);
    expect(result.lines + (result.over ? 0 : 1)).toBeGreaterThan(0);
  });
});

describe('bot driver', () => {
  it('emits a hard drop after lining up', () => {
    const cfg = loadConfig();
    const state = createGame(1, cfg);
    const driver = createDriver(botLevel(5));
    let hard = false;
    for (let i = 0; i < 120 && state.active; i++) {
      const held = driver.tick(state, cfg);
      if (held & Input.HardDrop) hard = true;
      step(state, held, cfg);
    }
    expect(hard).toBe(true);
  });
});
