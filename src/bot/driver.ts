import { Input, type GameState } from '@/engine';
import type { Config } from '@/engine/config';
import { spawnX } from '@/engine/pieces';

import type { BotLevel } from './levels';
import { choosePlacement, type Placement } from './search';

export interface BotDriver {
  held: number;
  decide(state: GameState, cfg: Config): Placement | null;
  tick(state: GameState, cfg: Config): number;
}

export function createDriver(level: BotLevel, noisy = false): BotDriver {
  let target: Placement | null = null;
  let cooldown = 0;

  return {
    get held() {
      return 0;
    },
    decide(state, cfg) {
      const pick = choosePlacement(state, cfg, level.weights, level.lookahead);
      if (!pick) return null;
      if (noisy && level.noise > 0 && Math.random() < level.noise) {
        return pick;
      }
      return pick;
    },
    tick(state, cfg) {
      if (!state.active) return 0;
      if (cooldown > 0) {
        cooldown -= 1;
        return 0;
      }
      if ((state.handling.prevHeld & Input.HardDrop) !== 0) return 0;
      if (!target) target = this.decide(state, cfg);
      if (!target) return 0;
      const piece = state.active;
      if (target.hold && !state.holdUsed) return Input.Hold;
      if (piece.rot !== target.rot) {
        const cw = (target.rot - piece.rot + 4) % 4;
        return cw === 3 ? Input.RotateCCW : Input.RotateCW;
      }
      if (piece.x < target.x) return Input.Right;
      if (piece.x > target.x) return Input.Left;
      const wait = Math.max(0, Math.round(60 / level.pps) - 1);
      cooldown = wait;
      target = null;
      return Input.HardDrop;
    },
  };
}

export function framesToPlacement(startX: number, dest: Placement): number {
  return Math.abs(dest.x - startX) + dest.rot + 1;
}

export function spawnColumn(type: Placement['type'], width: number): number {
  return spawnX(type, width);
}
