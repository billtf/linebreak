import { DEFAULT_WEIGHTS, type Weights } from './evaluate';

export interface BotLevel {
  id: number;
  pps: number;
  lookahead: number;
  noise: number;
  weights: Weights;
}

export const BOT_LEVELS: BotLevel[] = [
  { id: 1, pps: 0.5, lookahead: 0, noise: 0.35, weights: DEFAULT_WEIGHTS },
  { id: 2, pps: 1.0, lookahead: 0, noise: 0.2, weights: DEFAULT_WEIGHTS },
  { id: 3, pps: 1.5, lookahead: 1, noise: 0.1, weights: DEFAULT_WEIGHTS },
  { id: 4, pps: 2.0, lookahead: 1, noise: 0.05, weights: DEFAULT_WEIGHTS },
  { id: 5, pps: 2.5, lookahead: 1, noise: 0, weights: DEFAULT_WEIGHTS },
];

export function botLevel(id: number): BotLevel {
  return BOT_LEVELS.find((l) => l.id === id) ?? BOT_LEVELS[0]!;
}
