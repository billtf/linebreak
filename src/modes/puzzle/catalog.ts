import { parsePuzzle, type Puzzle } from './schema';

const modules = import.meta.glob('../../../puzzles/*.json', {
  eager: true,
  import: 'default',
});

export const PUZZLES: Puzzle[] = Object.entries(modules)
  .map(([path, data]) => parsePuzzle(data, path.split('/').pop() ?? path))
  .sort((a, b) => a.id.localeCompare(b.id));

export function puzzleById(id: string): Puzzle | undefined {
  return PUZZLES.find((p) => p.id === id);
}

export function puzzlesInTier(tier: number): Puzzle[] {
  return PUZZLES.filter((p) => p.tier === tier);
}

export const PUZZLE_IDS = PUZZLES.map((p) => p.id);
