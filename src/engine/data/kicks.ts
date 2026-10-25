import type { Rotation } from '../types';

/** Kick offset in guideline space: dx, dy with y+ up. */
export type Kick = readonly [dx: number, dy: number];

const JLSTZ: Record<string, readonly Kick[]> = {
  '0>1': [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  '1>0': [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  '1>2': [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  '2>1': [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  '2>3': [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  '3>2': [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  '3>0': [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  '0>3': [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
};

const I: Record<string, readonly Kick[]> = {
  '0>1': [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  '1>0': [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  '1>2': [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
  '2>1': [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  '2>3': [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  '3>2': [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  '3>0': [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  '0>3': [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
};

/** TETR.IO-style 180 kicks for JLSTZ. */
const JLSTZ_180: Record<string, readonly Kick[]> = {
  '0>2': [
    [0, 0],
    [0, 1],
    [1, 1],
    [-1, 1],
    [1, 0],
    [-1, 0],
  ],
  '2>0': [
    [0, 0],
    [0, -1],
    [-1, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
  ],
  '1>3': [
    [0, 0],
    [1, 0],
    [1, 2],
    [1, 1],
    [0, 2],
    [0, 1],
  ],
  '3>1': [
    [0, 0],
    [-1, 0],
    [-1, 2],
    [-1, 1],
    [0, 2],
    [0, 1],
  ],
};

const I_180: Record<string, readonly Kick[]> = {
  '0>2': [
    [0, 0],
    [0, 1],
    [1, 0],
    [-1, 0],
  ],
  '2>0': [
    [0, 0],
    [0, -1],
    [-1, 0],
    [1, 0],
  ],
  '1>3': [
    [0, 0],
    [1, 0],
    [0, 1],
    [0, -1],
  ],
  '3>1': [
    [0, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ],
};

const O_KICKS: readonly Kick[] = [[0, 0]];

function key(from: Rotation, to: Rotation): string {
  return `${from}>${to}`;
}

export function kicksFor(
  type: 'I' | 'O' | 'JLSTZ',
  from: Rotation,
  to: Rotation,
): readonly Kick[] {
  if (type === 'O') return O_KICKS;
  const k = key(from, to);
  const is180 =
    Math.abs(to - from) === 2 ||
    (from === 0 && to === 2) ||
    (from === 3 && to === 1);
  const table = type === 'I' ? (is180 ? I_180 : I) : is180 ? JLSTZ_180 : JLSTZ;
  const found = table[k];
  if (!found) {
    throw new Error(`missing kick table ${type} ${k}`);
  }
  return found;
}

export const SRS_JLSTZ = JLSTZ;
export const SRS_I = I;
export const SRS_JLSTZ_180 = JLSTZ_180;
export const SRS_I_180 = I_180;
