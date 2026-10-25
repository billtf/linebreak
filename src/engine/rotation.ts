import { collides } from './board';
import { kicksFor, type Kick } from './data/kicks';
import { wrapRotation } from './pieces';
import type { ActivePiece, PieceType, Rotation } from './types';

export interface RotateResult {
  piece: ActivePiece;
  kick: number;
}

function family(type: PieceType): 'I' | 'O' | 'JLSTZ' {
  if (type === 'I') return 'I';
  if (type === 'O') return 'O';
  return 'JLSTZ';
}

/** Apply a guideline (y+ up) kick onto a y-down board. */
export function applyKick(
  x: number,
  y: number,
  kick: Kick,
): { x: number; y: number } {
  return { x: x + kick[0], y: y - kick[1] };
}

export function tryRotate(
  board: Uint8Array,
  width: number,
  height: number,
  piece: ActivePiece,
  dir: 1 | -1 | 2,
): RotateResult | null {
  const to = wrapRotation(piece.rot + dir);
  const table = kicksFor(family(piece.type), piece.rot, to);
  for (let i = 0; i < table.length; i++) {
    const kick = table[i];
    if (!kick) continue;
    const next = applyKick(piece.x, piece.y, kick);
    if (!collides(board, width, height, piece.type, next.x, next.y, to)) {
      return {
        piece: {
          ...piece,
          x: next.x,
          y: next.y,
          rot: to,
          lastAction: 'rotate',
          lastKick: i,
        },
        kick: i,
      };
    }
  }
  return null;
}

export function rotationAfter(from: Rotation, dir: 1 | -1 | 2): Rotation {
  return wrapRotation(from + dir);
}
