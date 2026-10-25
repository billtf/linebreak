import { describe, expect, it } from 'vitest';

import { boardHash } from '@/engine/board';
import { loadConfig } from '@/engine/config';
import { createGame, step } from '@/engine/game';
import { Input } from '@/engine/types';

function hardDrop(
  state: ReturnType<typeof createGame>,
  cfg: ReturnType<typeof loadConfig>,
) {
  step(state, Input.HardDrop, cfg);
  step(state, 0, cfg);
}

describe('step()', () => {
  it('spawns a piece and hard-drops it', () => {
    const cfg = loadConfig();
    const state = createGame(1);
    expect(state.active).not.toBeNull();
    const first = state.active?.type;
    hardDrop(state, cfg);
    expect(state.score).toBeGreaterThan(0);
    expect(state.active?.type).not.toBeUndefined();
    expect(state.active?.type === first || state.hold === null).toBe(true);
  });

  it('slides to the wall with instant ARR and rotates CCW', () => {
    const overrides = { handling: { dasMs: 0, arrMs: 0 } };
    const cfg = loadConfig(overrides);
    const state = createGame(4, overrides);
    const startX = state.active!.x;
    step(state, Input.Left, cfg);
    step(state, Input.Left, cfg);
    expect(state.active!.x).toBeLessThan(startX);
    step(state, 0, cfg);
    step(state, Input.RotateCCW, cfg);
    expect(state.active?.rot).toBe(3);
  });

  it('holds a piece once per drop', () => {
    const cfg = loadConfig();
    const state = createGame(7);
    const original = state.active?.type;
    step(state, Input.Hold, cfg);
    expect(state.hold).toBe(original);
    expect(state.holdUsed).toBe(true);
    const after = state.active?.type;
    step(state, Input.Hold, cfg);
    expect(state.active?.type).toBe(after);
  });

  it('plays a scripted 20-piece game with a stable board and score', () => {
    const cfg = loadConfig();
    const state = createGame(2026);
    for (let i = 0; i < 20; i++) {
      const dir = i % 2 === 0 ? Input.Left : Input.Right;
      for (let t = 0; t < 4; t++) {
        step(state, dir, cfg);
        step(state, 0, cfg);
      }
      hardDrop(state, cfg);
    }
    expect(state.frame).toBeGreaterThan(20);
    expect(state.score).toBeGreaterThan(0);
    expect(boardHash(state.board)).toMatch(/^[0-9a-f]{8}$/);
    const replay = createGame(2026);
    for (let i = 0; i < 20; i++) {
      const dir = i % 2 === 0 ? Input.Left : Input.Right;
      for (let t = 0; t < 4; t++) {
        step(replay, dir, cfg);
        step(replay, 0, cfg);
      }
      hardDrop(replay, cfg);
    }
    expect(replay.score).toBe(state.score);
    expect(boardHash(replay.board)).toBe(boardHash(state.board));
  });
});
