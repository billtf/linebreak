export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type Rotation = 0 | 1 | 2 | 3;

export const enum Input {
  Left = 1 << 0,
  Right = 1 << 1,
  SoftDrop = 1 << 2,
  HardDrop = 1 << 3,
  RotateCW = 1 << 4,
  RotateCCW = 1 << 5,
  Rotate180 = 1 << 6,
  Hold = 1 << 7,
}

export type LastAction = 'move' | 'rotate' | 'drop' | 'spawn';

export interface ActivePiece {
  type: PieceType;
  x: number;
  y: number;
  rot: Rotation;
  lastAction: LastAction;
  lastKick: number;
  lockFrames: number;
  resets: number;
}

export interface RngState {
  seed: number;
  state: number;
  bag: PieceType[];
}

export interface HandlingState {
  dir: -1 | 0 | 1;
  dasFrames: number;
  arrFrames: number;
  prevHeld: number;
  dcdFrames: number;
}

export interface GameState {
  frame: number;
  board: Uint8Array;
  width: number;
  active: ActivePiece | null;
  hold: PieceType | null;
  holdUsed: boolean;
  queue: PieceType[];
  rng: RngState;
  gravityAcc: number;
  handling: HandlingState;
  score: number;
  level: number;
  lines: number;
  combo: number;
  backToBack: boolean;
  over: boolean;
}

export type ClearKind =
  | 'single'
  | 'double'
  | 'triple'
  | 'quad'
  | 'tspinMini'
  | 'tspin'
  | 'tspinSingle'
  | 'tspinDouble'
  | 'tspinTriple'
  | 'perfectClear';

export type GameEvent =
  | { t: 'spawn'; piece: PieceType }
  | { t: 'move' }
  | { t: 'rotate'; kick: number }
  | { t: 'lock'; cells: number[] }
  | {
      t: 'clear';
      rows: number[];
      kind: ClearKind;
      b2b: boolean;
      combo: number;
      points: number;
    }
  | { t: 'hold'; piece: PieceType }
  | { t: 'levelUp'; level: number }
  | { t: 'topOut' };

export interface StepResult {
  state: GameState;
  events: GameEvent[];
}

export type Config = import('./config').Config;
export type Step = (s: GameState, held: number, cfg: Config) => StepResult;

export interface Replay {
  version: 1;
  seed: number;
  mode: string;
  config: Config;
  inputs: Array<[frame: number, held: number]>;
  final: { score: number; boardHash: string };
}

export const PIECE_ID: Record<PieceType, number> = {
  I: 1,
  O: 2,
  T: 3,
  S: 4,
  Z: 5,
  J: 6,
  L: 7,
};

export const ID_PIECE: Record<number, PieceType> = {
  1: 'I',
  2: 'O',
  3: 'T',
  4: 'S',
  5: 'Z',
  6: 'J',
  7: 'L',
};

export const ALL_PIECES: readonly PieceType[] = [
  'I',
  'O',
  'T',
  'S',
  'Z',
  'J',
  'L',
];
