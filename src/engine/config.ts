import { z } from 'zod';

const PieceTypeSchema = z.enum(['I', 'O', 'T', 'S', 'Z', 'J', 'L']);

const BoardSchema = z
  .object({
    width: z.number().int().min(6).max(16),
    visibleHeight: z.number().int().positive(),
    bufferHeight: z.number().int().nonnegative(),
  })
  .strict();

const PiecesSchema = z
  .object({
    set: z.array(PieceTypeSchema).min(1),
    randomizer: z.literal('bag7'),
    previewCount: z.number().int().min(1).max(6),
    holdEnabled: z.boolean(),
    rotationSystem: z.literal('srs'),
    allow180: z.boolean(),
  })
  .strict();

const TimingSchema = z
  .object({
    tickHz: z.number().int().positive(),
    lockDelayFrames: z.number().int().nonnegative(),
    maxLockResets: z.number().int().nonnegative(),
    lineClearFrames: z.number().int().nonnegative(),
    spawnDelayFrames: z.number().int().nonnegative(),
    gravityCurve: z.literal('guideline'),
    softDropFactor: z.number().positive(),
  })
  .strict();

const HandlingSchema = z
  .object({
    dasMs: z.number().min(0).max(400),
    arrMs: z.number().min(0).max(100),
    dcdMs: z.number().min(0).max(100),
    hardDropGuardMs: z.number().min(0).max(200),
  })
  .strict();

const ScoringSchema = z
  .object({
    single: z.number(),
    double: z.number(),
    triple: z.number(),
    quad: z.number(),
    tspinMini: z.number(),
    tspin: z.number(),
    tspinSingle: z.number(),
    tspinDouble: z.number(),
    tspinTriple: z.number(),
    backToBackMultiplier: z.number(),
    comboPerStep: z.number(),
    softDropPerRow: z.number(),
    hardDropPerRow: z.number(),
    levelMultiplier: z.boolean(),
    perfectClear1: z.number(),
    perfectClear2: z.number(),
    perfectClear3: z.number(),
    perfectClear4: z.number(),
  })
  .strict();

const ProgressionSchema = z
  .object({
    startLevel: z.number().int().min(1),
    linesPerLevel: z.number().int().positive(),
    maxLevel: z.number().int().min(1),
  })
  .strict();

const AssistsSchema = z
  .object({
    undo: z.boolean(),
    gravityScale: z.number().positive(),
    ghost: z.boolean(),
  })
  .strict();

export const ConfigSchema = z
  .object({
    version: z.literal(1),
    board: BoardSchema,
    pieces: PiecesSchema,
    timing: TimingSchema,
    handling: HandlingSchema,
    scoring: ScoringSchema,
    progression: ProgressionSchema,
    assists: AssistsSchema,
    modifiers: z.array(z.string()),
    theme: z.string(),
    palette: z.string(),
  })
  .strict();

export type Config = z.infer<typeof ConfigSchema>;

export const DEFAULT_CONFIG: Config = {
  version: 1,
  board: { width: 10, visibleHeight: 20, bufferHeight: 20 },
  pieces: {
    set: ['I', 'O', 'T', 'S', 'Z', 'J', 'L'],
    randomizer: 'bag7',
    previewCount: 5,
    holdEnabled: true,
    rotationSystem: 'srs',
    allow180: true,
  },
  timing: {
    tickHz: 60,
    lockDelayFrames: 30,
    maxLockResets: 15,
    lineClearFrames: 9,
    spawnDelayFrames: 0,
    gravityCurve: 'guideline',
    softDropFactor: 20,
  },
  handling: { dasMs: 167, arrMs: 33, dcdMs: 0, hardDropGuardMs: 0 },
  scoring: {
    single: 100,
    double: 300,
    triple: 500,
    quad: 800,
    tspinMini: 100,
    tspin: 400,
    tspinSingle: 800,
    tspinDouble: 1200,
    tspinTriple: 1600,
    backToBackMultiplier: 1.5,
    comboPerStep: 50,
    softDropPerRow: 1,
    hardDropPerRow: 2,
    levelMultiplier: true,
    perfectClear1: 800,
    perfectClear2: 1200,
    perfectClear3: 1800,
    perfectClear4: 3200,
  },
  progression: { startLevel: 1, linesPerLevel: 10, maxLevel: 20 },
  assists: { undo: false, gravityScale: 1.0, ghost: true },
  modifiers: [],
  theme: 'default',
  palette: 'default',
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(override)) return base;
  const out: Record<string, unknown> = {
    ...(base as unknown as Record<string, unknown>),
  };
  for (const [key, value] of Object.entries(override)) {
    const current = out[key];
    if (isPlainObject(current) && isPlainObject(value)) {
      out[key] = deepMerge(current, value);
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}

export function parseConfig(input: unknown): Config {
  const result = ConfigSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid config: ${formatIssues(result.error)}`);
  }
  return result.data;
}

/** Deep-merge overrides onto the default config, then validate (unknown keys fail). */
export function loadConfig(overrides: unknown = {}): Config {
  return parseConfig(deepMerge(DEFAULT_CONFIG, overrides));
}

export function totalHeight(cfg: Config): number {
  return cfg.board.visibleHeight + cfg.board.bufferHeight;
}

export function visibleTop(cfg: Config): number {
  return cfg.board.bufferHeight;
}

export function msToFrames(ms: number, tickHz: number): number {
  return Math.round((ms * tickHz) / 1000);
}
