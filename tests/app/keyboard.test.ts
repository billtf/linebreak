import { describe, expect, it } from 'vitest';

import { codeToInput, DEFAULT_MAP } from '@/input/keyboard';
import { Input } from '@/engine';

describe('keyboard map', () => {
  it('maps guideline-style defaults by KeyboardEvent.code', () => {
    expect(codeToInput('ArrowLeft')).toBe(Input.Left);
    expect(codeToInput('ArrowRight')).toBe(Input.Right);
    expect(codeToInput('ArrowDown')).toBe(Input.SoftDrop);
    expect(codeToInput('Space')).toBe(Input.HardDrop);
    expect(codeToInput('ArrowUp')).toBe(Input.RotateCW);
    expect(codeToInput('KeyX')).toBe(Input.RotateCW);
    expect(codeToInput('KeyZ')).toBe(Input.RotateCCW);
    expect(codeToInput('KeyA')).toBe(Input.Rotate180);
    expect(codeToInput('KeyC')).toBe(Input.Hold);
    expect(codeToInput('ShiftLeft')).toBe(Input.Hold);
    expect(codeToInput('KeyQ')).toBe(0);
  });

  it('allows a remapped table', () => {
    expect(codeToInput('KeyQ', { ...DEFAULT_MAP, KeyQ: Input.Hold })).toBe(
      Input.Hold,
    );
  });
});
