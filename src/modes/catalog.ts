import { daily } from './daily';
import { marathon } from './marathon';
import type { Mode } from './mode';
import { puzzleMode } from './puzzle';
import { puzzleById } from './puzzle/catalog';
import { sprint } from './sprint';
import { ultra } from './ultra';
import { versus } from './versus';
import { zen } from './zen';

export const MODES: Record<string, Mode> = {
  marathon,
  sprint,
  ultra,
  daily,
  zen,
  versus,
};

export function puzzleModeById(id: string): Mode | undefined {
  const level = puzzleById(id);
  return level ? puzzleMode(level) : undefined;
}

export function modeById(id: string): Mode {
  return MODES[id] ?? marathon;
}
