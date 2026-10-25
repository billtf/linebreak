import { loadConfig, type Config, type GameState } from '@/engine';

import type { Mode, ModeResult } from './mode';

export const zen: Mode = {
  id: 'zen',
  config(base: Config): Config {
    return loadConfig({
      ...base,
      modifiers: ['zen'],
      assists: {
        ...base.assists,
        gravityScale: Math.min(base.assists.gravityScale, 0.5),
      },
    });
  },
  seed(): number {
    return Math.floor(Math.random() * 0xffffffff) >>> 0;
  },
  onEvent(): void {},
  result(s: GameState): ModeResult | null {
    if (s.over) {
      return {
        won: false,
        reason: 'quit',
        score: s.score,
        lines: s.lines,
        frames: s.frame,
      };
    }
    return null;
  },
  pbKey(cfg: Config): string {
    return `lb:v1:pb:zen:w${cfg.board.width}`;
  },
};
