import { daily } from './daily';
import { marathon } from './marathon';
import type { Mode } from './mode';
import { sprint } from './sprint';
import { ultra } from './ultra';
import { zen } from './zen';

export const MODES: Record<string, Mode> = {
  marathon,
  sprint,
  ultra,
  daily,
  zen,
};

export function modeById(id: string): Mode {
  return MODES[id] ?? marathon;
}
