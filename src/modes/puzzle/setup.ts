import {
  createBoard,
  createGame,
  loadConfig,
  spawnX,
  spawnY,
  totalHeight,
  type Config,
  type GameState,
} from '@/engine';
import { setCell } from '@/engine/board';

import type { Puzzle } from './schema';

export function puzzleConfig(base: Config, level: Puzzle): Config {
  return loadConfig({
    ...base,
    board: { ...base.board, width: level.width },
    pieces: {
      ...base.pieces,
      holdEnabled: false,
      previewCount: Math.min(6, Math.max(1, level.sequence.length)),
    },
    modifiers: ['sequence'],
  });
}

export function paintPuzzleBoard(
  board: Uint8Array,
  width: number,
  height: number,
  rows: string[],
): void {
  const bottom = height - 1;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const y = bottom - (rows.length - 1 - i);
    for (let x = 0; x < row.length && x < width; x++) {
      const ch = row[x];
      if (ch && ch !== '.' && ch !== ' ') {
        setCell(board, width, x, y, 1);
      }
    }
  }
}

export function createPuzzleGame(
  level: Puzzle,
  base: Config,
): { state: GameState; cfg: Config } {
  const cfg = puzzleConfig(base, level);
  const boot = loadConfig({
    ...cfg,
    modifiers: cfg.modifiers.filter((m) => m !== 'sequence'),
  });
  const state = createGame(1, boot);
  const height = totalHeight(cfg);
  state.board = createBoard(cfg);
  state.width = cfg.board.width;
  paintPuzzleBoard(state.board, state.width, height, level.board);
  const [first, ...rest] = level.sequence;
  if (!first) throw new Error(`${level.id}: empty sequence`);
  state.queue = rest.slice();
  state.active = {
    type: first,
    x: spawnX(first, state.width),
    y: spawnY(cfg.board.bufferHeight),
    rot: 0,
    lastAction: 'spawn',
    lastKick: 0,
    lockFrames: 0,
    resets: 0,
  };
  state.hold = null;
  state.holdUsed = false;
  state.over = false;
  return { state, cfg };
}
