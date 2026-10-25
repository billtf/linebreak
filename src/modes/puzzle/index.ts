import { isEmpty, type Config, type GameEvent, type GameState } from '@/engine';

import type { Mode, ModeResult } from '../mode';
import { type Puzzle, starCount } from './schema';

export interface PuzzleProgress {
  locks: number;
  met: boolean;
  kindHit: boolean;
  linesHit: boolean;
  emptied: boolean;
}

function kindFromRows(
  n: number,
): 'single' | 'double' | 'triple' | 'quad' | null {
  if (n === 1) return 'single';
  if (n === 2) return 'double';
  if (n === 3) return 'triple';
  if (n === 4) return 'quad';
  return null;
}

export function createProgress(): PuzzleProgress {
  return {
    locks: 0,
    met: false,
    kindHit: false,
    linesHit: false,
    emptied: false,
  };
}

export function applyPuzzleEvent(
  progress: PuzzleProgress,
  event: GameEvent,
  state: GameState,
  level: Puzzle,
): void {
  if (event.t === 'lock') progress.locks += 1;
  if (event.t === 'clear') {
    if (
      level.goal.type === 'clear' &&
      (event.kind === level.goal.kind ||
        (event.kind === 'perfectClear' &&
          kindFromRows(event.rows.length) === level.goal.kind))
    ) {
      progress.kindHit = true;
    }
    if (level.goal.type === 'lines' && state.lines >= level.goal.count) {
      progress.linesHit = true;
    }
    if (level.goal.type === 'empty' && isEmpty(state.board)) {
      progress.emptied = true;
    }
  }
  progress.met =
    (level.goal.type === 'clear' && progress.kindHit) ||
    (level.goal.type === 'lines' && progress.linesHit) ||
    (level.goal.type === 'empty' && progress.emptied);
}

export function puzzleResult(
  progress: PuzzleProgress,
  state: GameState,
  level: Puzzle,
): ModeResult | null {
  if (progress.met && progress.locks <= level.budget) {
    return {
      won: true,
      reason: 'clear',
      score: state.score,
      lines: state.lines,
      frames: state.frame,
      stars: starCount(level, progress.locks),
      tags: ['Puzzle'],
      puzzleId: level.id,
    };
  }
  if (progress.locks > level.budget || state.over) {
    return {
      won: false,
      reason: 'topOut',
      score: state.score,
      lines: state.lines,
      frames: state.frame,
      stars: 0,
      tags: ['Puzzle'],
      puzzleId: level.id,
    };
  }
  return null;
}

export function puzzleMode(level: Puzzle): Mode {
  const progress = createProgress();
  return {
    id: 'puzzle',
    config(base: Config): Config {
      return base;
    },
    seed: () => 1,
    onEvent(event, state) {
      applyPuzzleEvent(progress, event, state, level);
    },
    result(state) {
      return puzzleResult(progress, state, level);
    },
    pbKey: () => `lb:v1:pb:puzzle:${level.id}`,
  };
}

export { createPuzzleGame, puzzleConfig } from './setup';
export { parsePuzzle, starCount, type Puzzle } from './schema';
