import { addGarbage } from '../garbage';
import type { Config } from '../config';
import type { GameState } from '../types';
import { totalHeight } from '../config';

export function riseIfDue(
  state: GameState,
  cfg: Config,
  locks: number,
  every = 10,
): boolean {
  if (!cfg.modifiers.includes('rising')) return false;
  if (locks === 0 || locks % every !== 0) return false;
  addGarbage(
    state.board,
    state.width,
    totalHeight(cfg),
    1,
    state.frame % state.width,
  );
  return true;
}
