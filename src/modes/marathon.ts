import {
  DEFAULT_CONFIG,
  loadConfig,
  type Config,
  type GameState,
} from '@/engine';

import type { Mode, ModeResult } from './mode';

const LINE_GOAL = 150;

export function createMarathon(endless = false): Mode {
  return {
    id: 'marathon',
    config(base: Config): Config {
      return loadConfig({
        ...base,
        progression: { ...base.progression },
      });
    },
    seed(): number {
      return Math.floor(Math.random() * 0xffffffff) >>> 0;
    },
    onEvent(): void {},
    result(s: GameState): ModeResult | null {
      if (!endless && s.lines >= LINE_GOAL) {
        return {
          won: true,
          reason: 'clear',
          score: s.score,
          lines: s.lines,
          frames: s.frame,
        };
      }
      if (s.over) {
        return {
          won: false,
          reason: 'topOut',
          score: s.score,
          lines: s.lines,
          frames: s.frame,
        };
      }
      return null;
    },
    pbKey(cfg: Config): string {
      return `lb:v1:pb:marathon:w${cfg.board.width}`;
    },
  };
}

export const marathon = createMarathon();

export function marathonConfig(): Config {
  return marathon.config(DEFAULT_CONFIG, {});
}
