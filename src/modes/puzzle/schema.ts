import { z } from 'zod';

export const PuzzleGoalSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('lines'),
      count: z.number().int().positive(),
    })
    .strict(),
  z
    .object({
      type: z.literal('clear'),
      kind: z.enum([
        'single',
        'double',
        'triple',
        'quad',
        'tspinMini',
        'tspin',
        'tspinSingle',
        'tspinDouble',
        'tspinTriple',
        'perfectClear',
      ]),
    })
    .strict(),
  z.object({ type: z.literal('empty') }).strict(),
]);

export const PuzzleSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    tier: z.number().int().min(1).max(4),
    width: z.number().int().min(6).max(16),
    board: z.array(z.string().min(1)).min(1),
    sequence: z
      .array(z.enum(['I', 'O', 'T', 'S', 'Z', 'J', 'L']))
      .min(1)
      .max(16),
    goal: PuzzleGoalSchema,
    budget: z.number().int().positive(),
    stars: z.tuple([
      z.number().int().positive(),
      z.number().int().positive(),
      z.number().int().positive(),
    ]),
    solution: z.array(
      z.tuple([z.number().int().nonnegative(), z.number().int()]),
    ),
  })
  .strict();

export type Puzzle = z.infer<typeof PuzzleSchema>;
export type PuzzleGoal = z.infer<typeof PuzzleGoalSchema>;

export function parsePuzzle(input: unknown, fileName = 'puzzle'): Puzzle {
  const result = PuzzleSchema.safeParse(input);
  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
        return `${path}: ${issue.message}`;
      })
      .join('; ');
    throw new Error(`${fileName}: ${detail}`);
  }
  const puzzle = result.data;
  for (let i = 0; i < puzzle.board.length; i++) {
    const row = puzzle.board[i];
    if (!row) continue;
    if (row.length !== puzzle.width) {
      throw new Error(
        `${fileName}: board.${i}: expected width ${puzzle.width}, got ${row.length}`,
      );
    }
  }
  return puzzle;
}

export function starCount(puzzle: Puzzle, piecesUsed: number): number {
  if (piecesUsed <= puzzle.stars[0]) return 3;
  if (piecesUsed <= puzzle.stars[1]) return 2;
  if (piecesUsed <= puzzle.stars[2]) return 1;
  return 0;
}

export function tierOf(id: string): number {
  const match = /^t(\d)-/.exec(id);
  return match ? Number(match[1]) : 1;
}
