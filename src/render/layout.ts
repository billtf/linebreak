export interface Layout {
  cell: number;
  boardX: number;
  boardY: number;
  holdX: number;
  holdY: number;
  nextX: number;
  nextY: number;
  hudX: number;
  hudY: number;
  width: number;
  height: number;
  collapsed: boolean;
}

export function computeLayout(
  viewW: number,
  viewH: number,
  boardWidth: number,
): Layout {
  const cell = Math.max(
    4,
    Math.floor(Math.min(viewW / (boardWidth + 10), viewH / 22)),
  );
  const collapsed = cell < 14;
  const boardW = boardWidth * cell;
  const boardH = 20 * cell;
  const panel = 5 * cell;
  const gap = cell;
  const totalW = collapsed ? boardW : panel + gap + boardW + gap + panel;
  const totalH = collapsed ? boardH + 6 * cell : boardH + 3 * cell;
  const originX = Math.floor((viewW - totalW) / 2);
  const originY = Math.floor((viewH - totalH) / 2);
  const boardX = collapsed ? originX : originX + panel + gap;
  const boardY = originY;
  return {
    cell,
    boardX,
    boardY,
    holdX: collapsed ? boardX : originX,
    holdY: collapsed ? boardY + boardH + gap : boardY,
    nextX: collapsed ? boardX + boardW - panel : boardX + boardW + gap,
    nextY: collapsed ? boardY + boardH + gap : boardY,
    hudX: boardX,
    hudY: collapsed ? boardY + boardH + 3 * cell : boardY + boardH + gap,
    width: viewW,
    height: viewH,
    collapsed,
  };
}
