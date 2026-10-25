import { describe, expect, it } from 'vitest';

import { createGame, loadConfig } from '@/engine';
import { marathon } from '@/modes/marathon';

describe('marathon mode', () => {
  it('ends at 150 lines with a win', () => {
    const state = createGame(1);
    state.lines = 150;
    const result = marathon.result(state);
    expect(result?.won).toBe(true);
    expect(result?.reason).toBe('clear');
  });

  it('ends on top out', () => {
    const state = createGame(1);
    state.over = true;
    expect(marathon.result(state)?.reason).toBe('topOut');
  });

  it('keys personal bests by width', () => {
    expect(marathon.pbKey(loadConfig())).toBe('lb:v1:pb:marathon:w10');
    expect(marathon.pbKey(loadConfig({ board: { width: 16 } }))).toBe(
      'lb:v1:pb:marathon:w16',
    );
  });
});
