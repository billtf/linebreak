import { loadConfig, type Config, type GameState } from '@/engine';

import type { Mode, ModeResult } from './mode';

export function dailySeed(date = new Date()): number {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return Number(`${y}${m}${d}`);
}

export const daily: Mode = {
  id: 'daily',
  config(base: Config): Config {
    return loadConfig({
      ...base,
      board: { ...base.board, width: 10 },
    });
  },
  seed(): number {
    return dailySeed();
  },
  onEvent(): void {},
  result(s: GameState): ModeResult | null {
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
    return `lb:v1:pb:daily:${dailySeed()}:w${cfg.board.width}`;
  },
};
