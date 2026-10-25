import { cellsAt, type GameState, type PieceType } from '@/engine';

import type { Effects } from './effects';
import type { Layout } from './layout';
import { PIECE_COLORS, THEME } from './theme';

function box(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
): void {
  ctx.fillStyle = THEME.panel;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = THEME.muted;
  ctx.font = `${Math.max(10, h * 0.12)}px ui-sans-serif, system-ui`;
  ctx.textAlign = 'left';
  ctx.fillText(label, x + 6, y + 14);
}

function mini(
  ctx: CanvasRenderingContext2D,
  type: PieceType | null,
  x: number,
  y: number,
  cell: number,
): void {
  if (!type) return;
  const size = Math.max(6, Math.floor(cell * 0.7));
  for (const [cx, cy] of cellsAt(type, 0, 0, 0)) {
    ctx.fillStyle = PIECE_COLORS[type];
    ctx.fillRect(x + cx * size + 8, y + cy * size + 20, size - 1, size - 1);
  }
}

export function renderHud(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  layout: Layout,
  fx: Effects,
  elapsedSec: number,
): void {
  const { cell, holdX, holdY, nextX, nextY, hudX, hudY } = layout;
  const panel = 5 * cell;

  box(ctx, holdX, holdY, panel, 5 * cell, 'HOLD');
  mini(ctx, state.hold, holdX, holdY, cell);

  box(ctx, nextX, nextY, panel, 16 * cell, 'NEXT');
  const preview = state.queue.slice(0, 5);
  for (let i = 0; i < preview.length; i++) {
    const type = preview[i];
    if (type) mini(ctx, type, nextX, nextY + i * 3 * cell, cell);
  }

  ctx.fillStyle = THEME.text;
  ctx.font = `${Math.max(12, cell * 0.7)}px ui-sans-serif, system-ui`;
  ctx.textAlign = 'left';
  const pps = piecesPerSecond(Math.max(0, state.lines), elapsedSec);
  const lines = [
    `SCORE  ${state.score}`,
    `LEVEL  ${state.level}`,
    `LINES  ${state.lines}`,
    `TIME   ${formatTime(elapsedSec)}`,
    `PPS    ${pps.toFixed(2)}`,
  ];
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i] ?? '', hudX, hudY + (i + 1) * cell);
  }

  if (fx.callout && fx.calloutT > 0) {
    ctx.fillStyle = THEME.text;
    ctx.font = `700 ${Math.max(16, cell * 1.2)}px ui-sans-serif, system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText(
      fx.callout,
      layout.boardX + (state.width * cell) / 2,
      layout.boardY + 4 * cell,
    );
    ctx.textAlign = 'left';
  }
}

export function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function piecesPerSecond(lockCount: number, sec: number): number {
  if (sec <= 0) return 0;
  return lockCount / sec;
}
