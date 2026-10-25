import type { Config, GameState } from '@/engine';

import type { Mode, ModeResult } from './mode';

export const local2p: Mode = {
  id: 'versus',
  config(base: Config): Config {
    return base;
  },
  seed: () => 1,
  onEvent() {},
  result(s: GameState): ModeResult | null {
    if (!s.over) return null;
    return {
      won: false,
      reason: 'topOut',
      score: s.score,
      lines: s.lines,
      frames: s.frame,
      tags: ['Local 2P'],
    };
  },
  pbKey: () => 'lb:v1:pb:local2p',
};
