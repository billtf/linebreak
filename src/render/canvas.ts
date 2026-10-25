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

export interface DrawOpts {
  invisible?: boolean;
  mirror?: boolean;
  big?: boolean;
}

export function renderBoard(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  layout: Layout,
  ghost: number | null,
  fx: Effects,
  bufferTop: number,
  opts: DrawOpts = {},
): void {
  const { cell, boardX, boardY } = layout;
  const w = state.width;
  const visH = 20;
  const col = (x: number) => (opts.mirror ? w - 1 - x : x);

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
      if (opts.invisible && !flash) continue;
      const color = flash ? THEME.flash : pieceColor(id);
      if (!color) continue;
      const dx = boardX + col(x) * cell;
      const dy = boardY + y * cell;
      if (opts.big) {
        const half = cell / 2;
        drawCell(ctx, dx, dy, half, color);
        drawCell(ctx, dx + half, dy, half, color);
        drawCell(ctx, dx, dy + half, half, color);
        drawCell(ctx, dx + half, dy + half, half, color);
      } else {
        drawCell(ctx, dx, dy, cell, color);
      }
    }
  }

  if (state.active && ghost !== null) {
    drawActive(
      ctx,
      state.active.type,
      boardX,
      boardY,
      cell,
      state.active.x,
      ghost - bufferTop,
      state.active.rot,
      THEME.ghost,
      col,
    );
  }

  if (state.active) {
    const color =
      fx.lockFlash > 0 ? THEME.lock : PIECE_COLORS[state.active.type];
    drawActive(
      ctx,
      state.active.type,
      boardX,
      boardY,
      cell,
      state.active.x,
      state.active.y - bufferTop,
      state.active.rot,
      color,
      col,
    );
  }
}

function drawActive(
  ctx: CanvasRenderingContext2D,
  type: PieceType,
  ox: number,
  oy: number,
  cell: number,
  x: number,
  y: number,
  rot: 0 | 1 | 2 | 3,
  color: string,
  col: (n: number) => number,
): void {
  for (const [cx, cy] of cellsAt(type, x, y, rot)) {
    drawCell(ctx, ox + col(cx) * cell, oy + cy * cell, cell, color);
  }
}

export { visibleTop };
