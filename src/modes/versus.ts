import {
  addGarbage,
  attackLines,
  cancelGarbage,
  type Config,
  type GameEvent,
  type GameState,
} from '@/engine';
import { totalHeight } from '@/engine/config';

import type { Mode, ModeResult } from './mode';

export interface VersusMatch {
  incoming: [number, number];
  over: 'a' | 'b' | null;
}

export function createVersusMatch(): VersusMatch {
  return { incoming: [0, 0], over: null };
}

export function versusOnEvents(
  match: VersusMatch,
  side: 0 | 1,
  events: GameEvent[],
  foe: GameState,
  cfg: Config,
): void {
  const other = side === 0 ? 1 : 0;
  for (const event of events) {
    if (event.t === 'clear') {
      const raw = attackLines(event.kind, event.b2b, event.combo);
      const incoming = match.incoming[side] ?? 0;
      const { send, leftoverIncoming } = cancelGarbage(raw, incoming);
      match.incoming[side] = leftoverIncoming;
      match.incoming[other] = (match.incoming[other] ?? 0) + send;
    }
    if (event.t === 'topOut') match.over = side === 0 ? 'a' : 'b';
  }
  const pending = match.incoming[other] ?? 0;
  if (pending > 0 && events.some((e) => e.t === 'lock')) {
    addGarbage(
      foe.board,
      foe.width,
      totalHeight(cfg),
      pending,
      foe.frame % foe.width,
    );
    match.incoming[other] = 0;
  }
}

export const versus: Mode = {
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
      tags: ['Versus'],
    };
  },
  pbKey: () => 'lb:v1:pb:versus',
};
