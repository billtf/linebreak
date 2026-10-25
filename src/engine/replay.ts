import { boardHash } from './board';
import type { Config } from './config';
import { parseConfig } from './config';
import { createGame, step } from './game';
import type { GameState, Replay } from './types';

export function appendInput(
  inputs: Array<[number, number]>,
  frame: number,
  held: number,
  prevHeld: number,
): void {
  if (held !== prevHeld) inputs.push([frame, held]);
}

export function playInputs(
  state: GameState,
  cfg: Config,
  inputs: Array<[number, number]>,
  frames: number,
): GameState {
  let held = 0;
  let i = 0;
  for (let n = 0; n < frames; n++) {
    while (i < inputs.length) {
      const pair = inputs[i];
      if (!pair || pair[0] !== state.frame) break;
      held = pair[1];
      i += 1;
    }
    step(state, held, cfg);
  }
  return state;
}

export function playReplay(replay: Replay, extraFrames = 0): GameState {
  const cfg = parseConfig(replay.config);
  const state = createGame(replay.seed, replay.config);
  const lastFrame = replay.inputs.reduce((m, [f]) => Math.max(m, f), 0);
  const frames = lastFrame + 1 + extraFrames;
  return playInputs(state, cfg, replay.inputs, frames);
}

export function makeReplay(
  seed: number,
  mode: string,
  cfg: Config,
  inputs: Array<[number, number]>,
  state: GameState,
): Replay {
  return {
    version: 1,
    seed,
    mode,
    config: cfg,
    inputs,
    final: { score: state.score, boardHash: boardHash(state.board) },
  };
}

export function replayMatches(replay: Replay, state: GameState): boolean {
  return (
    state.score === replay.final.score &&
    boardHash(state.board) === replay.final.boardHash
  );
}
