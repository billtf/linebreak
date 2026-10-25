import type { Config, GameEvent, GameState } from '@/engine';

export interface ModeResult {
  won: boolean;
  reason: 'topOut' | 'clear' | 'quit';
  score: number;
  lines: number;
  frames: number;
  stars?: number;
  tags?: string[];
  puzzleId?: string;
}

export interface Mode {
  id: 'marathon' | 'sprint' | 'ultra' | 'daily' | 'zen' | 'puzzle' | 'versus';
  config(base: Config, options: Record<string, unknown>): Config;
  seed(): number;
  onEvent(e: GameEvent, s: GameState): void;
  result(s: GameState): ModeResult | null;
  pbKey(cfg: Config): string;
}
