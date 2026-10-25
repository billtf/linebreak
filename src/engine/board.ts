import type { Config } from './config';
import { totalHeight } from './config';
import { cellsAt } from './pieces';
import type { ActivePiece, PieceType, Rotation } from './types';
import { PIECE_ID } from './types';

export function createBoard(cfg: Config): Uint8Array {
  return new Uint8Array(cfg.board.width * totalHeight(cfg));
}

export function indexOf(width: number, x: number, y: number): number {
  return y * width + x;
}

export function getCell(
  board: Uint8Array,
  width: number,
  x: number,
  y: number,
): number {
  return board[indexOf(width, x, y)] ?? 0;
}

export function setCell(
  board: Uint8Array,
  width: number,
  x: number,
  y: number,
  value: number,
): void {
  board[indexOf(width, x, y)] = value;
}

export function collides(
  board: Uint8Array,
  width: number,
  height: number,
  type: PieceType,
  x: number,
  y: number,
  rot: Rotation,
): boolean {
  for (const [cx, cy] of cellsAt(type, x, y, rot)) {
    if (cx < 0 || cx >= width || cy < 0 || cy >= height) return true;
    if (getCell(board, width, cx, cy) !== 0) return true;
  }
  return false;
}

export function collidesPiece(
  board: Uint8Array,
  width: number,
  height: number,
  piece: ActivePiece,
): boolean {
  return collides(
    board,
    width,
    height,
    piece.type,
    piece.x,
    piece.y,
    piece.rot,
  );
}

export function place(
  board: Uint8Array,
  width: number,
  piece: ActivePiece,
): number[] {
  const id = PIECE_ID[piece.type];
  const cells: number[] = [];
  for (const [cx, cy] of cellsAt(piece.type, piece.x, piece.y, piece.rot)) {
    setCell(board, width, cx, cy, id);
    cells.push(indexOf(width, cx, cy));
  }
  return cells;
}

export function rowFull(board: Uint8Array, width: number, y: number): boolean {
  for (let x = 0; x < width; x++) {
    if (getCell(board, width, x, y) === 0) return false;
  }
  return true;
}

/** Clear full rows (including non-adjacent). Returns cleared y indices, top to bottom. */
export function clearLines(
  board: Uint8Array,
  width: number,
  height: number,
): number[] {
  const cleared: number[] = [];
  let write = height - 1;
  for (let y = height - 1; y >= 0; y--) {
    if (rowFull(board, width, y)) {
      cleared.push(y);
      continue;
    }
    if (write !== y) {
      for (let x = 0; x < width; x++) {
        setCell(board, width, x, write, getCell(board, width, x, y));
      }
    }
    write--;
  }
  while (write >= 0) {
    for (let x = 0; x < width; x++) {
      setCell(board, width, x, write, 0);
    }
    write--;
  }
  cleared.sort((a, b) => a - b);
  return cleared;
}

export function isEmpty(board: Uint8Array): boolean {
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== 0) return false;
  }
  return true;
}

export function boardHash(board: Uint8Array): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < board.length; i++) {
    h ^= board[i] ?? 0;
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function cloneBoard(board: Uint8Array): Uint8Array {
  return new Uint8Array(board);
}
