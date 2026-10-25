import { createGame, Input, loadConfig, step } from '@/engine';

import { botLevel } from './levels';
import { choosePlacement } from './search';

export function snapLines(
  levelId: number,
  seed: number,
  maxLines: number,
): number {
  const level = botLevel(levelId);
  const cfg = loadConfig();
  const state = createGame(seed, cfg);
  let guard = 0;
  while (state.lines < maxLines && !state.over && guard++ < 8000) {
    const pick = choosePlacement(state, cfg, level.weights, level.lookahead);
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
  return state.lines;
}

export function league(matches = 10, maxLines = 40): number[][] {
  const matrix: number[][] = [];
  for (let a = 1; a <= 5; a++) {
    const row: number[] = [];
    for (let b = 1; b <= 5; b++) {
      let wins = 0;
      for (let m = 0; m < matches; m++) {
        const la = snapLines(a, 100 + m, maxLines);
        const lb = snapLines(b, 100 + m, maxLines);
        if (la > lb) wins += 1;
      }
      row.push(wins / matches);
    }
    matrix.push(row);
  }
  return matrix;
}
