import { createBoard, setCell } from '@/engine/board';
import type { Config } from '@/engine/config';
import { DEFAULT_CONFIG, loadConfig, totalHeight } from '@/engine/config';
import type { ActivePiece, PieceType, Rotation } from '@/engine/types';

export function cfg(overrides: unknown = {}): Config {
  return loadConfig(overrides);
}

export function paintVisible(
  rows: string[],
  overrides: unknown = {},
  fill = 1,
): { board: Uint8Array; cfg: Config } {
  const c = cfg(overrides);
  const board = createBoard(c);
  const top = c.board.bufferHeight;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const y = top + i;
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch && ch !== '.' && ch !== ' ') {
        setCell(board, c.board.width, x, y, fill);
      }
    }
  }
  return { board, cfg: c };
}

export function piece(
  type: PieceType,
  x: number,
  y: number,
  rot: Rotation = 0,
  extra: Partial<ActivePiece> = {},
): ActivePiece {
  return {
    type,
    x,
    y,
    rot,
    lastAction: 'spawn',
    lastKick: 0,
    lockFrames: 0,
    resets: 0,
    ...extra,
  };
}

export function height(c: Config = DEFAULT_CONFIG): number {
  return totalHeight(c);
}
