import {
  boardHash,
  clearLines,
  cloneBoard,
  collides,
  createBoard,
  getCell,
  isEmpty,
  place,
  setCell,
} from './board';
import type { Config } from './config';
import { loadConfig, totalHeight } from './config';
import { gravityThisTick } from './gravity';
import { createHandling, onRotate, tickHandling, wasPressed } from './handling';
import {
  applyLockReset,
  isGrounded,
  lockedAboveVisible,
  tickLock,
} from './lock';
import { cellsAt, spawnX, spawnY } from './pieces';
import { createRngState, fillQueue, takePiece } from './randomizer';
import { tryRotate } from './rotation';
import { scoreClear } from './scoring';
import { clearKindFor, detectTSpin } from './tspin';
import type {
  ActivePiece,
  GameEvent,
  GameState,
  PieceType,
  StepResult,
} from './types';
import { Input } from './types';

export function cloneState(state: GameState): GameState {
  return {
    ...state,
    board: cloneBoard(state.board),
    active: state.active ? { ...state.active } : null,
    queue: state.queue.slice(),
    rng: {
      seed: state.rng.seed,
      state: state.rng.state,
      bag: state.rng.bag.slice(),
    },
    handling: { ...state.handling },
  };
}

function makeActive(
  type: PieceType,
  width: number,
  bufferHeight: number,
): ActivePiece {
  return {
    type,
    x: spawnX(type, width),
    y: spawnY(bufferHeight),
    rot: 0,
    lastAction: 'spawn',
    lastKick: 0,
    lockFrames: 0,
    resets: 0,
  };
}

function pullNext(state: GameState, cfg: Config): PieceType {
  fillQueue(
    state.queue,
    state.rng,
    cfg.pieces.previewCount + 1,
    cfg.pieces.set,
  );
  const next = state.queue.shift();
  if (!next) {
    return takePiece(state.rng, cfg.pieces.set);
  }
  fillQueue(state.queue, state.rng, cfg.pieces.previewCount, cfg.pieces.set);
  return next;
}

function spawn(state: GameState, cfg: Config, events: GameEvent[]): boolean {
  if (cfg.modifiers.includes('sequence') && state.queue.length === 0) {
    state.active = null;
    state.over = true;
    events.push({ t: 'topOut' });
    return false;
  }
  const type = pullNext(state, cfg);
  const piece = makeActive(type, state.width, cfg.board.bufferHeight);
  const height = totalHeight(cfg);
  const blocked = () =>
    collides(
      state.board,
      state.width,
      height,
      piece.type,
      piece.x,
      piece.y,
      piece.rot,
    );
  if (blocked() && cfg.modifiers.includes('zen')) {
    while (blocked() && !isEmpty(state.board)) {
      for (let y = height - 1; y > 0; y--) {
        for (let x = 0; x < state.width; x++) {
          setCell(
            state.board,
            state.width,
            x,
            y,
            getCell(state.board, state.width, x, y - 1),
          );
        }
      }
      for (let x = 0; x < state.width; x++) {
        setCell(state.board, state.width, x, 0, 0);
      }
    }
  }
  if (blocked()) {
    state.active = piece;
    state.over = true;
    events.push({ t: 'topOut' });
    return false;
  }
  state.active = piece;
  state.gravityAcc = 0;
  events.push({ t: 'spawn', piece: type });
  return true;
}

function afterShift(
  state: GameState,
  cfg: Config,
  events: GameEvent[],
): boolean {
  if (!state.active) return false;
  state.active.lastAction = 'move';
  events.push({ t: 'move' });
  if (isGrounded(state, cfg) || state.active.lockFrames > 0) {
    if (applyLockReset(state, cfg) === 'lock') {
      lockPiece(state, cfg, events);
      return true;
    }
  } else {
    state.active.lockFrames = 0;
  }
  return false;
}

function tryShift(
  state: GameState,
  cfg: Config,
  dx: number,
  dy: number,
): boolean {
  if (!state.active) return false;
  const height = totalHeight(cfg);
  const nx = state.active.x + dx;
  const ny = state.active.y + dy;
  if (
    collides(
      state.board,
      state.width,
      height,
      state.active.type,
      nx,
      ny,
      state.active.rot,
    )
  ) {
    return false;
  }
  state.active.x = nx;
  state.active.y = ny;
  return true;
}

function dropRows(state: GameState, cfg: Config, maxRows: number): number {
  let rows = 0;
  while (rows < maxRows && tryShift(state, cfg, 0, 1)) {
    rows += 1;
    if (state.active) state.active.lastAction = 'drop';
  }
  return rows;
}

function doHold(state: GameState, cfg: Config, events: GameEvent[]): void {
  if (!state.active || state.holdUsed || !cfg.pieces.holdEnabled) return;
  const current = state.active.type;
  if (state.hold === null) {
    state.hold = current;
    state.active = null;
    state.holdUsed = true;
    events.push({ t: 'hold', piece: current });
    spawn(state, cfg, events);
    if (state.active) state.holdUsed = true;
    return;
  }
  const swapped = state.hold;
  state.hold = current;
  state.active = makeActive(swapped, state.width, cfg.board.bufferHeight);
  state.holdUsed = true;
  state.gravityAcc = 0;
  events.push({ t: 'hold', piece: current });
  const height = totalHeight(cfg);
  if (
    collides(
      state.board,
      state.width,
      height,
      state.active.type,
      state.active.x,
      state.active.y,
      state.active.rot,
    )
  ) {
    state.over = true;
    events.push({ t: 'topOut' });
  }
}

function rotate(
  state: GameState,
  cfg: Config,
  dir: 1 | -1 | 2,
  events: GameEvent[],
): boolean {
  if (!state.active) return false;
  const height = totalHeight(cfg);
  const result = tryRotate(state.board, state.width, height, state.active, dir);
  if (!result) return false;
  state.active = result.piece;
  onRotate(state.handling, cfg);
  events.push({ t: 'rotate', kick: result.kick });
  if (isGrounded(state, cfg) || result.piece.lockFrames > 0) {
    if (applyLockReset(state, cfg) === 'lock') {
      lockPiece(state, cfg, events);
      return true;
    }
  } else if (state.active) {
    state.active.lockFrames = 0;
  }
  return false;
}

function lockPiece(state: GameState, cfg: Config, events: GameEvent[]): void {
  const piece = state.active;
  if (!piece) return;
  if (lockedAboveVisible(piece, cfg)) {
    const cells = cellsAt(piece.type, piece.x, piece.y, piece.rot).map(
      ([x, y]) => y * state.width + x,
    );
    events.push({ t: 'lock', cells });
    state.over = true;
    events.push({ t: 'topOut' });
    state.active = null;
    return;
  }
  const height = totalHeight(cfg);
  const spin = detectTSpin(state.board, state.width, height, piece);
  const cells = place(state.board, state.width, piece);
  events.push({ t: 'lock', cells });
  const rows = clearLines(state.board, state.width, height);
  const kind = clearKindFor(rows.length, spin);
  if (kind && (rows.length > 0 || spin !== 'none')) {
    if (rows.length > 0) state.combo += 1;
    else state.combo = 0;
    const perfect = isEmpty(state.board);
    const scored = scoreClear(
      {
        kind,
        lines: rows.length,
        combo: state.combo,
        backToBack: state.backToBack,
        perfect,
        level: state.level,
      },
      cfg,
    );
    state.score += scored.points;
    state.backToBack = scored.nextBackToBack;
    events.push({
      t: 'clear',
      rows,
      kind: scored.kind,
      b2b: scored.b2bAwarded,
      combo: state.combo,
      points: scored.points,
    });
    if (rows.length > 0) {
      state.lines += rows.length;
      const nextLevel = Math.min(
        cfg.progression.maxLevel,
        cfg.progression.startLevel +
          Math.floor(state.lines / cfg.progression.linesPerLevel),
      );
      if (nextLevel > state.level) {
        state.level = nextLevel;
        events.push({ t: 'levelUp', level: state.level });
      }
    }
  } else {
    state.combo = 0;
  }
  state.active = null;
  state.holdUsed = false;
  if (!state.over) spawn(state, cfg, events);
}

function applyGravity(state: GameState, cfg: Config, held: number): number {
  if (!state.active) return 0;
  const soft = (held & Input.SoftDrop) !== 0;
  state.gravityAcc += gravityThisTick(state.level, cfg, soft);
  let dropped = 0;
  while (state.gravityAcc >= 1 && state.active) {
    if (!tryShift(state, cfg, 0, 1)) {
      state.gravityAcc = 0;
      break;
    }
    state.gravityAcc -= 1;
    dropped += 1;
    state.active.lastAction = 'drop';
  }
  if (soft && dropped > 0) {
    state.score += dropped * cfg.scoring.softDropPerRow;
  }
  return dropped;
}

export function createGame(seed: number, overrides: unknown = {}): GameState {
  const cfg = loadConfig(overrides);
  const rng = createRngState(seed, cfg.pieces.set);
  const queue: PieceType[] = [];
  fillQueue(queue, rng, cfg.pieces.previewCount, cfg.pieces.set);
  const state: GameState = {
    frame: 0,
    board: createBoard(cfg),
    width: cfg.board.width,
    active: null,
    hold: null,
    holdUsed: false,
    queue,
    rng,
    gravityAcc: 0,
    handling: createHandling(),
    score: 0,
    level: cfg.progression.startLevel,
    lines: 0,
    combo: 0,
    backToBack: false,
    over: false,
  };
  const events: GameEvent[] = [];
  spawn(state, cfg, events);
  return state;
}

export function step(state: GameState, held: number, cfg: Config): StepResult {
  const events: GameEvent[] = [];
  if (state.over) {
    state.handling.prevHeld = held;
    state.frame += 1;
    return { state, events };
  }

  if (!state.active) {
    spawn(state, cfg, events);
    if (state.over) {
      state.handling.prevHeld = held;
      state.frame += 1;
      return { state, events };
    }
  }

  const prev = state.handling.prevHeld;

  if (wasPressed(held, prev, Input.Hold)) {
    doHold(state, cfg, events);
  }

  if (state.active && !state.over) {
    if (
      wasPressed(held, prev, Input.RotateCW) &&
      rotate(state, cfg, 1, events)
    ) {
      state.handling.prevHeld = held;
      state.frame += 1;
      return { state, events };
    }
    if (
      state.active &&
      wasPressed(held, prev, Input.RotateCCW) &&
      rotate(state, cfg, -1, events)
    ) {
      state.handling.prevHeld = held;
      state.frame += 1;
      return { state, events };
    }
    if (
      state.active &&
      cfg.pieces.allow180 &&
      wasPressed(held, prev, Input.Rotate180) &&
      rotate(state, cfg, 2, events)
    ) {
      state.handling.prevHeld = held;
      state.frame += 1;
      return { state, events };
    }
  }

  let lockedOut = false;
  if (state.active && !state.over) {
    const move = tickHandling(state.handling, held, cfg);
    if (move.dir !== 0 && move.count > 0) {
      if (move.instant) {
        while (tryShift(state, cfg, move.dir, 0)) {
          if (afterShift(state, cfg, events)) {
            lockedOut = true;
            break;
          }
        }
      } else if (tryShift(state, cfg, move.dir, 0)) {
        lockedOut = afterShift(state, cfg, events);
      }
    }
  }

  if (lockedOut) {
    // Piece already locked this tick; do not gravity the replacement.
  } else if (
    state.active &&
    !state.over &&
    wasPressed(held, prev, Input.HardDrop)
  ) {
    const rows = dropRows(state, cfg, totalHeight(cfg));
    state.score += rows * cfg.scoring.hardDropPerRow;
    if (state.active) state.active.lastAction = 'drop';
    lockPiece(state, cfg, events);
  } else if (state.active && !state.over) {
    applyGravity(state, cfg, held);
    if (state.active && isGrounded(state, cfg)) {
      if (tickLock(state, cfg)) {
        lockPiece(state, cfg, events);
      }
    } else if (state.active) {
      state.active.lockFrames = 0;
    }
  }

  state.handling.prevHeld = held;
  state.frame += 1;
  return { state, events };
}

export function ghostY(state: GameState, cfg: Config): number | null {
  if (!state.active) return null;
  const height = totalHeight(cfg);
  let y = state.active.y;
  while (
    !collides(
      state.board,
      state.width,
      height,
      state.active.type,
      state.active.x,
      y + 1,
      state.active.rot,
    )
  ) {
    y += 1;
  }
  return y;
}

export { boardHash, loadConfig };
