import { cellsAt, ID_PIECE, type GameState, type PieceType } from '@/engine';
import { visibleTop } from '@/engine/config';

import type { Effects } from './effects';
import type { Layout } from './layout';
import { PIECE_COLORS, THEME } from './theme';

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
): void {
  ctx.fillStyle = color;
  roundRect(ctx, x + 1, y + 1, size - 2, size - 2, Math.max(2, size * 0.16));
  ctx.fill();
}

function pieceColor(id: number): string | null {
  const type = ID_PIECE[id];
  return type ? PIECE_COLORS[type] : null;
}

export function drawMinos(
  ctx: CanvasRenderingContext2D,
  type: PieceType,
  ox: number,
  oy: number,
  cell: number,
  x: number,
  y: number,
  rot: 0 | 1 | 2 | 3,
  color = PIECE_COLORS[type],
): void {
  for (const [cx, cy] of cellsAt(type, x, y, rot)) {
    drawCell(ctx, ox + cx * cell, oy + cy * cell, cell, color);
  }
}

export function renderBoard(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  layout: Layout,
  ghost: number | null,
  fx: Effects,
  bufferTop: number,
): void {
  const { cell, boardX, boardY } = layout;
  const w = state.width;
  const visH = 20;

  ctx.fillStyle = THEME.board;
  ctx.fillRect(boardX, boardY, w * cell, visH * cell);

  ctx.strokeStyle = THEME.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= w; x++) {
    ctx.moveTo(boardX + x * cell + 0.5, boardY);
    ctx.lineTo(boardX + x * cell + 0.5, boardY + visH * cell);
  }
  for (let y = 0; y <= visH; y++) {
    ctx.moveTo(boardX, boardY + y * cell + 0.5);
    ctx.lineTo(boardX + w * cell, boardY + y * cell + 0.5);
  }
  ctx.stroke();

  const dangerY = visH - 17;
  if (!fx.reducedMotion) {
    ctx.fillStyle = THEME.danger;
    ctx.fillRect(boardX, boardY, w * cell, dangerY * cell);
  }

  for (let y = 0; y < visH; y++) {
    const by = bufferTop + y;
    const flash = fx.clearFlash > 0 && fx.clearRows.includes(by);
    for (let x = 0; x < w; x++) {
      const id = state.board[by * w + x] ?? 0;
      const color = flash ? THEME.flash : pieceColor(id);
      if (!color) continue;
      drawCell(ctx, boardX + x * cell, boardY + y * cell, cell, color);
    }
  }

  if (state.active && ghost !== null) {
    const visY = ghost - bufferTop;
    drawMinos(
      ctx,
      state.active.type,
      boardX,
      boardY,
      cell,
      state.active.x,
      visY,
      state.active.rot,
      THEME.ghost,
    );
  }

  if (state.active) {
    const visY = state.active.y - bufferTop;
    const color =
      fx.lockFlash > 0 ? THEME.lock : PIECE_COLORS[state.active.type];
    drawMinos(
      ctx,
      state.active.type,
      boardX,
      boardY,
      cell,
      state.active.x,
      visY,
      state.active.rot,
      color,
    );
  }
}

export { visibleTop };
