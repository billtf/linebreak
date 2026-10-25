import { describe, expect, it } from 'vitest';

import { loadConfig } from '@/engine/config';
import { createGame, step } from '@/engine/game';
import {
  appendInput,
  makeReplay,
  playInputs,
  replayMatches,
} from '@/engine/replay';
import { Input } from '@/engine/types';

function run(seed: number, plan: number[]) {
  const cfg = loadConfig();
  const live = createGame(seed);
  const inputs: Array<[number, number]> = [];
  let prev = 0;
  for (const held of plan) {
    appendInput(inputs, live.frame, held, prev);
    step(live, held, cfg);
    prev = held;
  }
  const replay = makeReplay(seed, 'marathon', cfg, inputs, live);
  const played = createGame(seed);
  playInputs(played, cfg, replay.inputs, plan.length);
  return { replay, played, live };
}

describe('golden replays', () => {
  it('replay A: ten hard drops', () => {
    const plan = Array.from({ length: 20 }, (_, i) =>
      i % 2 === 0 ? Input.HardDrop : 0,
    );
    const { replay, played } = run(1, plan);
    expect(replayMatches(replay, played)).toBe(true);
    expect(played.score).toBe(replay.final.score);
  });

  it('replay B: shifts, rotates, hold', () => {
    const plan = [
      Input.Left,
      Input.Left,
      Input.RotateCW,
      Input.HardDrop,
      0,
      Input.Hold,
      0,
      Input.Right,
      Input.RotateCCW,
      Input.HardDrop,
      0,
      Input.Rotate180,
      Input.SoftDrop,
      Input.SoftDrop,
      Input.HardDrop,
      0,
    ];
    const { replay, played } = run(99, plan);
    expect(replayMatches(replay, played)).toBe(true);
  });

  it('replay C: long mash stays deterministic', () => {
    const plan: number[] = [];
    for (let i = 0; i < 80; i++) {
      if (i % 5 === 0) plan.push(Input.HardDrop);
      else if (i % 5 === 1) plan.push(0);
      else if (i % 5 === 2) plan.push(Input.Left);
      else if (i % 5 === 3) plan.push(Input.RotateCW);
      else plan.push(Input.Right);
    }
    const { replay, played } = run(20261025, plan);
    expect(replayMatches(replay, played)).toBe(true);
  });
});
