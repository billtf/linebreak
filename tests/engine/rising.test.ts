import { describe, expect, it } from 'vitest';

import { createGame, loadConfig } from '@/engine';
import { isEmpty } from '@/engine/board';
import { riseIfDue } from '@/engine/modifiers/rising';

describe('rising modifier', () => {
  it('adds a garbage row every 10 locks', () => {
    const cfg = loadConfig({ modifiers: ['rising'] });
    const state = createGame(1, cfg);
    expect(riseIfDue(state, cfg, 9)).toBe(false);
    expect(riseIfDue(state, cfg, 10)).toBe(true);
    expect(isEmpty(state.board)).toBe(false);
  });
});
