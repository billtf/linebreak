import { describe, expect, it } from 'vitest';

import { createBoard } from '@/engine/board';
import { DEFAULT_CONFIG, loadConfig } from '@/engine/config';
import { createGame, step } from '@/engine/game';
import { applyLockReset, isGrounded, tickLock } from '@/engine/lock';
import { piece } from './helpers';

describe('lock delay', () => {
  it('locks after 30 grounded frames', () => {
    const state = {
      ...createGame(1),
      board: createBoard(DEFAULT_CONFIG),
      active: piece('O', 3, 38),
    };
    expect(isGrounded(state, DEFAULT_CONFIG)).toBe(true);
    for (let i = 0; i < 29; i++) {
      expect(tickLock(state, DEFAULT_CONFIG)).toBe(false);
    }
    expect(tickLock(state, DEFAULT_CONFIG)).toBe(true);
  });

  it('locks at reset 16', () => {
    const state = {
      ...createGame(1),
      active: piece('O', 3, 38, 0, { resets: 0, lockFrames: 10 }),
    };
    for (let i = 0; i < 15; i++) {
      expect(applyLockReset(state, DEFAULT_CONFIG)).toBe('reset');
    }
    expect(state.active?.resets).toBe(15);
    expect(applyLockReset(state, DEFAULT_CONFIG)).toBe('lock');
  });

  it('tops out when spawn is blocked', () => {
    const cfg = loadConfig();
    const state = createGame(1);
    state.board.fill(1);
    state.active = null;
    const { events } = step(state, 0, cfg);
    expect(state.over).toBe(true);
    expect(events.some((e) => e.t === 'topOut')).toBe(true);
  });
});
