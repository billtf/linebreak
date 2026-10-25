import type { PieceType, Rotation } from './types';

export type Cell = readonly [x: number, y: number];

/** Occupied cells per type and rotation. y increases downward. */
export const SHAPES: Record<PieceType, readonly (readonly Cell[])[]> = {
  I: [
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
    ],
  ],
  O: [
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
    ],
  ],
  T: [
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [2, 1],
      [1, 2],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [1, 2],
    ],
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  ],
  S: [
    [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [2, 1],
      [2, 2],
    ],
    [
      [1, 1],
      [2, 1],
      [0, 2],
      [1, 2],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  ],
  Z: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [2, 0],
      [1, 1],
      [2, 1],
      [1, 2],
    ],
    [
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [0, 2],
    ],
  ],
  J: [
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [2, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 2],
      [1, 2],
    ],
  ],
  L: [
    [
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [0, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
  ],
};

export function shapeOf(type: PieceType, rot: Rotation): readonly Cell[] {
  const rotations = SHAPES[type];
  const shape = rotations[rot];
  if (!shape) {
    throw new Error(`missing shape ${type} rot ${rot}`);
  }
  return shape;
}

export function pieceBounds(
  type: PieceType,
  rot: Rotation,
): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
} {
  const shape = shapeOf(type, rot);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of shape) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

/** Left-biased spawn column for rotation 0: floor((width − pieceWidth) / 2) − minX. */
export function spawnX(type: PieceType, boardWidth: number): number {
  const { minX, width } = pieceBounds(type, 0);
  return Math.floor((boardWidth - width) / 2) - minX;
}

/** Origin y so a piece occupies spec spawn rows 21–22 (1-indexed from the bottom). */
export function spawnY(bufferHeight: number): number {
  return bufferHeight - 2;
}

export function cellsAt(
  type: PieceType,
  x: number,
  y: number,
  rot: Rotation,
): Array<[number, number]> {
  const shape = shapeOf(type, rot);
  const cells: Array<[number, number]> = [];
  for (const [sx, sy] of shape) {
    cells.push([x + sx, y + sy]);
  }
  return cells;
}

export function wrapRotation(rot: number): Rotation {
  return (((rot % 4) + 4) % 4) as Rotation;
}
