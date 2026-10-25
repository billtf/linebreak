import { getCell, setCell } from './board';
import type { ClearKind } from './types';

/** Spec attack table before back-to-back and combo. */
export function attackForKind(kind: ClearKind): number {
  switch (kind) {
    case 'double':
      return 1;
    case 'triple':
      return 2;
    case 'quad':
    case 'tspinDouble':
      return 4;
    case 'tspinTriple':
      return 6;
    case 'perfectClear':
      return 10;
    default:
      return 0;
  }
}

/** Combo 2 → +1 … combo 6+ → +5. First clear in a chain is combo 1. */
export function comboAttack(combo: number): number {
  if (combo <= 1) return 0;
  return Math.min(5, combo - 1);
}

export function attackLines(
  kind: ClearKind,
  backToBack: boolean,
  combo: number,
): number {
  const base = attackForKind(kind);
  if (base === 0 && kind !== 'single' && kind !== 'tspinMini') return 0;
  const b2b = backToBack && base > 0 ? 1 : 0;
  return base + b2b + comboAttack(combo);
}

export function cancelGarbage(
  outgoing: number,
  incoming: number,
): { send: number; leftoverIncoming: number } {
  if (outgoing >= incoming) {
    return { send: outgoing - incoming, leftoverIncoming: 0 };
  }
  return { send: 0, leftoverIncoming: incoming - outgoing };
}

/** Insert `rows` garbage lines at the bottom; one hole column per batch. */
export function addGarbage(
  board: Uint8Array,
  width: number,
  height: number,
  rows: number,
  hole: number,
): void {
  if (rows <= 0) return;
  const col = ((hole % width) + width) % width;
  for (let n = 0; n < rows; n++) {
    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width; x++) {
        setCell(board, width, x, y, getCell(board, width, x, y + 1));
      }
    }
    const bottom = height - 1;
    for (let x = 0; x < width; x++) {
      setCell(board, width, x, bottom, x === col ? 0 : 8);
    }
  }
}
