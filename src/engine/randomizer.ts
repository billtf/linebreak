import { clonePrng, createPrng, nextInt, type Prng } from './prng';
import { ALL_PIECES, type PieceType, type RngState } from './types';

export function shuffleBag(
  rng: Prng,
  pieces: readonly PieceType[],
): PieceType[] {
  const bag = pieces.slice();
  for (let i = bag.length - 1; i > 0; i--) {
    const j = nextInt(rng, i + 1);
    const a = bag[i];
    const b = bag[j];
    if (a === undefined || b === undefined) {
      throw new Error('bag shuffle index out of range');
    }
    bag[i] = b;
    bag[j] = a;
  }
  return bag;
}

export function createRngState(
  seed: number,
  pieces: readonly PieceType[] = ALL_PIECES,
): RngState {
  const rng = createPrng(seed);
  return { seed: rng.seed, state: rng.state, bag: shuffleBag(rng, pieces) };
}

export function rngFromState(state: RngState): Prng {
  return { seed: state.seed, state: state.state };
}

export function takePiece(
  state: RngState,
  pieces: readonly PieceType[],
): PieceType {
  if (state.bag.length === 0) {
    const rng = rngFromState(state);
    state.bag = shuffleBag(rng, pieces);
    state.state = rng.state;
  }
  const piece = state.bag.shift();
  if (!piece) {
    throw new Error('randomizer bag empty after refill');
  }
  return piece;
}

export function fillQueue(
  queue: PieceType[],
  state: RngState,
  previewCount: number,
  pieces: readonly PieceType[],
): void {
  while (queue.length < previewCount) {
    queue.push(takePiece(state, pieces));
  }
}

export function cloneRngState(state: RngState): RngState {
  return {
    seed: state.seed,
    state: state.state,
    bag: state.bag.slice(),
  };
}

export function peekSequence(
  state: RngState,
  count: number,
  pieces: readonly PieceType[],
): PieceType[] {
  const clone = cloneRngState(state);
  const out: PieceType[] = [];
  for (let i = 0; i < count; i++) {
    out.push(takePiece(clone, pieces));
  }
  return out;
}

export { clonePrng, createPrng };
