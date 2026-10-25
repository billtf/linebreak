import { loadConfig, type Config, type GameState } from '@/engine';

import type { Mode, ModeResult } from './mode';

const LIMIT = 120 * 60;

export const ultra: Mode = {
  id: 'ultra',
  config(base: Config): Config {
    return loadConfig(base);
  },
  seed(): number {
    return Math.floor(Math.random() * 0xffffffff) >>> 0;
  },
  onEvent(): void {},
  result(s: GameState): ModeResult | null {
    if (s.frame >= LIMIT || s.over) {
      return {
        won: s.frame >= LIMIT && !s.over,
        reason: s.over ? 'topOut' : 'clear',
        score: s.score,
        lines: s.lines,
        frames: s.frame,
      };
    }
    return null;
  },
  pbKey(cfg: Config): string {
    return `lb:v1:pb:ultra:w${cfg.board.width}`;
  },
};
