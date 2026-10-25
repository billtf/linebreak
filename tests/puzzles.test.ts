import { describe, expect, it } from 'vitest';

import { DEFAULT_CONFIG, step } from '@/engine';
import {
  applyPuzzleEvent,
  createProgress,
  createPuzzleGame,
  parsePuzzle,
  puzzleResult,
  starCount,
} from '@/modes/puzzle';
import { PUZZLES } from '@/modes/puzzle/catalog';

describe('puzzle schema', () => {
  it('rejects a malformed level with the file name and field', () => {
    expect(() => parsePuzzle({ id: 1 }, 'broken.json')).toThrow(/broken.json/);
    expect(() => parsePuzzle({ id: 1 }, 'broken.json')).toThrow(/id/);
  });

  it('loads every committed level', () => {
    expect(PUZZLES).toHaveLength(20);
  });
});

describe('puzzle goals', () => {
  const level = parsePuzzle(
    {
      id: 'fx-lines',
      title: 'fixture',
      tier: 1,
      width: 10,
      board: ['XXX....XXX'],
      sequence: ['I'],
      goal: { type: 'lines', count: 1 },
      budget: 1,
      stars: [1, 1, 1],
      solution: [[0, 8]],
    },
    'fx-lines.json',
  );

  it('passes when the lines goal is met', () => {
    const { state } = createPuzzleGame(level, DEFAULT_CONFIG);
    const progress = createProgress();
    progress.linesHit = true;
    progress.met = true;
    progress.locks = 1;
    const result = puzzleResult(progress, state, level);
    expect(result?.won).toBe(true);
    expect(result?.stars).toBe(3);
  });

  it('fails when the budget is exceeded', () => {
    const { state } = createPuzzleGame(level, DEFAULT_CONFIG);
    const progress = createProgress();
    progress.locks = 2;
    expect(puzzleResult(progress, state, level)?.won).toBe(false);
  });
});

describe('starter solutions', () => {
  for (const level of PUZZLES) {
    it(`${level.id} solution earns 3 stars`, () => {
      const { state, cfg } = createPuzzleGame(level, DEFAULT_CONFIG);
      const progress = createProgress();
      const last = level.solution.reduce((m, [f]) => Math.max(m, f), 0);
      let held = 0;
      let i = 0;
      for (let n = 0; n < last + 45; n++) {
        while (i < level.solution.length) {
          const pair = level.solution[i];
          if (!pair || pair[0] !== state.frame) break;
          held = pair[1];
          i += 1;
        }
        const { events } = step(state, held, cfg);
        for (const event of events)
          applyPuzzleEvent(progress, event, state, level);
      }
      const result = puzzleResult(progress, state, level);
      expect(result?.won, `${level.id} ${JSON.stringify(result)}`).toBe(true);
      expect(starCount(level, progress.locks)).toBe(3);
    });
  }
});
