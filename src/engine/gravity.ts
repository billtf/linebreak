import type { Config } from './config';

/** Guideline seconds/row, then 20G from level 20. */
export function secondsPerRow(level: number): number {
  if (level >= 20) return 0;
  const n = level - 1;
  return (0.8 - n * 0.007) ** n;
}

export function cellsPerFrame(level: number, cfg: Config): number {
  const scale = cfg.assists.gravityScale;
  if (level >= 20) return 20 * scale;
  const seconds = secondsPerRow(level);
  return (1 / (seconds * cfg.timing.tickHz)) * scale;
}

export function gravityThisTick(
  level: number,
  cfg: Config,
  softDrop: boolean,
): number {
  const base = cellsPerFrame(level, cfg);
  if (!softDrop) return base;
  return base * cfg.timing.softDropFactor;
}
