import { describe, expect, it } from 'vitest';

import { pollGamepad } from '@/input/gamepad';
import { Input } from '@/engine';

function stubPad(buttons: number[], axes: number[] = [0, 0]): Gamepad {
  return {
    buttons: buttons.map((v) => ({
      pressed: v === 1,
      touched: v === 1,
      value: v,
    })),
    axes,
  } as unknown as Gamepad;
}

describe('gamepad', () => {
  it('maps the standard layout onto the engine bitmask', () => {
    expect(pollGamepad(null)).toBe(0);
    expect(pollGamepad(stubPad([1, 0, 0, 0])) & Input.RotateCW).toBe(
      Input.RotateCW,
    );
    expect(
      pollGamepad(stubPad(new Array(16).fill(0), [-1, 0])) & Input.Left,
    ).toBe(Input.Left);
  });
});
