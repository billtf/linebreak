import type { Config } from './config';
import type { ClearKind } from './types';

type ScoreNumberKey = {
  [K in keyof Config['scoring']]: Config['scoring'][K] extends number
    ? K
    : never;
}[keyof Config['scoring']];

const BASE: Record<ClearKind, ScoreNumberKey | null> = {
  single: 'single',
  double: 'double',
  triple: 'triple',
  quad: 'quad',
  tspinMini: 'tspinMini',
  tspin: 'tspin',
  tspinSingle: 'tspinSingle',
  tspinDouble: 'tspinDouble',
  tspinTriple: 'tspinTriple',
  perfectClear: null,
};

export function isB2BClear(kind: ClearKind): boolean {
  return (
    kind === 'quad' ||
    kind === 'tspinSingle' ||
    kind === 'tspinDouble' ||
    kind === 'tspinTriple'
  );
}

export function perfectClearPoints(lines: number, cfg: Config): number {
  if (lines === 1) return cfg.scoring.perfectClear1;
  if (lines === 2) return cfg.scoring.perfectClear2;
  if (lines === 3) return cfg.scoring.perfectClear3;
  if (lines === 4) return cfg.scoring.perfectClear4;
  return 0;
}

export function baseClearPoints(kind: ClearKind, cfg: Config): number {
  const key = BASE[kind];
  if (!key) return 0;
  return cfg.scoring[key];
}

export interface ScoreClearInput {
  kind: ClearKind;
  lines: number;
  combo: number;
  backToBack: boolean;
  perfect: boolean;
  level: number;
}

export interface ScoreClearResult {
  points: number;
  kind: ClearKind;
  b2bAwarded: boolean;
  nextBackToBack: boolean;
}

export function scoreClear(
  input: ScoreClearInput,
  cfg: Config,
): ScoreClearResult {
  const { lines, combo, backToBack, perfect, level } = input;
  let kind = input.kind;
  let points = baseClearPoints(kind, cfg);
  const b2bWorthy = isB2BClear(kind);
  const b2bAwarded = b2bWorthy && backToBack;
  if (b2bAwarded) {
    points *= cfg.scoring.backToBackMultiplier;
  }
  if (combo > 1) {
    points += cfg.scoring.comboPerStep * (combo - 1);
  }
  if (perfect) {
    points += perfectClearPoints(lines, cfg);
    kind = 'perfectClear';
  }
  if (cfg.scoring.levelMultiplier) {
    points *= level;
  }
  const nextBackToBack = lines === 0 ? backToBack : b2bWorthy;
  return { points, kind, b2bAwarded, nextBackToBack };
}
