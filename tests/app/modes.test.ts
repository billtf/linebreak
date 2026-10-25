import { describe, expect, it } from 'vitest';

import { createGame, createRngState, loadConfig, peekSequence } from '@/engine';
import { ALL_PIECES } from '@/engine/types';
import { daily, dailySeed } from '@/modes/daily';
import { sprint } from '@/modes/sprint';
import { ultra } from '@/modes/ultra';
import { applyOption } from '@/ui/screens/options';
import { DEFAULT_OPTIONS, toConfig } from '@/storage/options';

describe('v1 modes', () => {
  it('sprint ends at 40 lines', () => {
    const state = createGame(1);
    state.lines = 40;
    expect(sprint.result(state)?.won).toBe(true);
  });

  it('ultra ends at 2 minutes', () => {
    const state = createGame(1);
    state.frame = 120 * 60;
    expect(ultra.result(state)?.reason).toBe('clear');
  });

  it('daily seed is YYYYMMDD and width is 10', () => {
    expect(dailySeed(new Date('2026-10-25T12:00:00'))).toBe(20261025);
    const cfg = daily.config(loadConfig({ board: { width: 16 } }), {});
    expect(cfg.board.width).toBe(10);
    const seed = dailySeed(new Date('2026-10-25T08:00:00'));
    expect(peekSequence(createRngState(seed), 50, ALL_PIECES)).toEqual(
      peekSequence(createRngState(seed), 50, ALL_PIECES),
    );
  });

  it('options map onto config, daily forces width 10', () => {
    const wide = applyOption(DEFAULT_OPTIONS, 'gameplay.boardWidth', '14');
    expect(toConfig(wide, 'marathon').board.width).toBe(14);
    expect(toConfig(wide, 'daily').board.width).toBe(10);
    expect(toConfig(wide, 'zen').modifiers).toContain('zen');
  });
});
