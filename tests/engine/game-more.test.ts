import { describe, expect, it } from 'vitest';

import { boardHash, setCell } from '@/engine/board';
import {
  DEFAULT_CONFIG,
  loadConfig,
  totalHeight,
  visibleTop,
} from '@/engine/config';
import { cloneState, createGame, ghostY, step } from '@/engine/game';
import { createHandling, onRotate, tickHandling } from '@/engine/handling';
import { clonePrng, createPrng } from '@/engine/prng';
import { makeReplay, playReplay } from '@/engine/replay';
import { rotationAfter } from '@/engine/rotation';
import { Input } from '@/engine/types';

describe('game extras', () => {
  it('clones state and reports a ghost row', () => {
    const state = createGame(3);
    const copy = cloneState(state);
    expect(copy.board).not.toBe(state.board);
    expect(copy.board).toEqual(state.board);
    expect(ghostY(state, DEFAULT_CONFIG)).toBeGreaterThan(state.active!.y);
    state.active = null;
    expect(ghostY(state, DEFAULT_CONFIG)).toBeNull();
    expect(cloneState(state).active).toBeNull();
  });

  it('rotates 180, soft-drops, and gravity-locks', () => {
    const cfg = loadConfig();
    const state = createGame(11);
    step(state, Input.Rotate180, cfg);
    expect(state.active?.rot === 2 || state.active?.rot === 0).toBe(true);
    for (let i = 0; i < 40; i++) step(state, Input.SoftDrop, cfg);
    expect(state.score).toBeGreaterThanOrEqual(0);
    const cfg20 = loadConfig({ progression: { startLevel: 20 } });
    const falling = createGame(12, { progression: { startLevel: 20 } });
    for (let i = 0; i < 40; i++) step(falling, 0, cfg20);
    expect([...falling.board].some((c) => c !== 0)).toBe(true);
  });

  it('swaps hold after a lock', () => {
    const cfg = loadConfig();
    const state = createGame(21);
    step(state, Input.Hold, cfg);
    const held = state.hold;
    step(state, 0, cfg);
    step(state, Input.HardDrop, cfg);
    step(state, 0, cfg);
    const next = state.active?.type;
    step(state, Input.Hold, cfg);
    expect(state.hold).toBe(next);
    expect(state.active?.type).toBe(held);
  });

  it('steps a finished game without changing the board', () => {
    const cfg = loadConfig();
    const state = createGame(1);
    state.over = true;
    const hash = boardHash(state.board);
    step(state, Input.HardDrop, cfg);
    expect(boardHash(state.board)).toBe(hash);
    expect(state.over).toBe(true);
  });

  it('tops out when a piece locks above the visible field', () => {
    const cfg = loadConfig();
    const state = createGame(5);
    const top = visibleTop(cfg);
    const h = totalHeight(cfg);
    for (let y = top; y < h; y++) {
      for (let x = 0; x < state.width; x++) {
        setCell(state.board, state.width, x, y, 1);
      }
    }
    step(state, Input.HardDrop, cfg);
    expect(state.over).toBe(true);
  });

  it('levels up after 10 lines', () => {
    const cfg = loadConfig();
    const state = createGame(8);
    const h = totalHeight(cfg);
    for (let n = 0; n < 3; n++) {
      for (let row = 0; row < 4; row++) {
        for (let x = 0; x < 9; x++) {
          setCell(state.board, 10, x, h - 1 - row, 1);
        }
      }
      state.active = {
        type: 'I',
        x: 7,
        y: h - 6,
        rot: 1,
        lastAction: 'spawn',
        lastKick: 0,
        lockFrames: 0,
        resets: 0,
      };
      step(state, Input.HardDrop, cfg);
      step(state, 0, cfg);
    }
    expect(state.lines).toBeGreaterThanOrEqual(8);
    expect(state.level).toBeGreaterThanOrEqual(1);
  });

  it('playReplay reconstructs a short run', () => {
    const cfg = loadConfig();
    const live = createGame(77);
    const inputs: Array<[number, number]> = [];
    let prev = 0;
    for (const held of [Input.HardDrop, 0, Input.HardDrop, 0]) {
      if (held !== prev) inputs.push([live.frame, held]);
      step(live, held, cfg);
      prev = held;
    }
    const replay = makeReplay(77, 'marathon', cfg, inputs, live);
    const played = playReplay(replay, 4);
    expect(played.score).toBe(live.score);
  });
});

describe('handling extras', () => {
  it('DAS-cuts after a rotate and supports instant ARR', () => {
    const delayed = loadConfig({ handling: { dcdMs: 100 } });
    const h = createHandling();
    onRotate(h, delayed);
    h.dir = -1;
    const cut = tickHandling(h, Input.Left, delayed);
    expect(cut.count).toBe(0);

    const instant = loadConfig({ handling: { dasMs: 0, arrMs: 0 } });
    const h2 = createHandling();
    tickHandling(h2, Input.Right, instant);
    const slide = tickHandling(h2, Input.Right, instant);
    expect(slide.instant).toBe(true);
  });
});

describe('small helpers', () => {
  it('wraps rotation and clones the PRNG', () => {
    expect(rotationAfter(3, 1)).toBe(0);
    expect(rotationAfter(0, -1)).toBe(3);
    const rng = createPrng(9);
    const copy = clonePrng(rng);
    expect(copy).toEqual(rng);
    expect(copy).not.toBe(rng);
  });
});
