import type { Config, GameState } from '@/engine';
import { ghostY, visibleTop } from '@/engine';

import type { Effects } from './effects';
import { computeLayout } from './layout';
import { renderBoard } from './canvas';
import { THEME } from './theme';

export function versusFits(viewW: number): boolean {
  return viewW >= 900;
}

export function renderVersus(
  ctx: CanvasRenderingContext2D,
  a: GameState,
  b: GameState,
  cfg: Config,
  fxA: Effects,
  fxB: Effects,
  viewW: number,
  viewH: number,
  incoming: [number, number],
): void {
  const half = Math.floor(viewW / 2);
  const layoutA = computeLayout(half, viewH, a.width);
  const layoutB = computeLayout(half, viewH, b.width);
  layoutB.boardX += half;
  layoutB.holdX += half;
  layoutB.nextX += half;
  layoutB.hudX += half;
  renderBoard(ctx, a, layoutA, ghostY(a, cfg), fxA, visibleTop(cfg));
  renderBoard(ctx, b, layoutB, ghostY(b, cfg), fxB, visibleTop(cfg));
  ctx.fillStyle = THEME.muted;
  ctx.font = '12px ui-sans-serif, system-ui';
  ctx.fillText(`IN ${incoming[0]}`, layoutA.boardX, layoutA.boardY - 8);
  ctx.fillText(`IN ${incoming[1]}`, layoutB.boardX, layoutB.boardY - 8);
}

export { versusFits as twoBoardsFit };
