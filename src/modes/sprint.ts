import { loadConfig, type Config, type GameState } from '@/engine';

import type { Mode, ModeResult } from './mode';

export const sprint: Mode = {
  id: 'sprint',
  config(base: Config): Config {
    return loadConfig(base);
  },
  seed(): number {
    return Math.floor(Math.random() * 0xffffffff) >>> 0;
  },
  onEvent(): void {},
  result(s: GameState): ModeResult | null {
    if (s.lines >= 40) {
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
    return `lb:v1:pb:sprint:w${cfg.board.width}`;
  },
};
