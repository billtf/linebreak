import { describe, expect, it } from 'vitest';

import { boardHash } from '@/engine/board';
import { loadConfig } from '@/engine/config';
import { createGame, step } from '@/engine/game';
import {
  appendInput,
  makeReplay,
  playInputs,
  replayMatches,
} from '@/engine/replay';
import { Input } from '@/engine/types';

describe('replays', () => {
  it('records only frames where the held mask changes', () => {
    const inputs: Array<[number, number]> = [];
    appendInput(inputs, 0, Input.Left, 0);
    appendInput(inputs, 1, Input.Left, Input.Left);
    appendInput(inputs, 2, 0, Input.Left);
    expect(inputs).toEqual([
      [0, Input.Left],
      [2, 0],
    ]);
  });

  it('replays to the same score and board hash', () => {
    const cfg = loadConfig();
    const seed = 42;
    const inputs: Array<[number, number]> = [];
    const live = createGame(seed);
    let prev = 0;
    const plan = [
      Input.HardDrop,
      0,
      Input.Left,
      Input.Left,
      Input.HardDrop,
      0,
      Input.Right,
      Input.RotateCW,
      Input.HardDrop,
      0,
    ];
    for (const held of plan) {
      appendInput(inputs, live.frame, held, prev);
      step(live, held, cfg);
      prev = held;
    }
    const replay = makeReplay(seed, 'marathon', cfg, inputs, live);
    const played = createGame(seed);
    playInputs(played, cfg, replay.inputs, plan.length);
    expect(replayMatches(replay, played)).toBe(true);
    expect(played.score).toBe(live.score);
    expect(boardHash(played.board)).toBe(boardHash(live.board));
  });
});
