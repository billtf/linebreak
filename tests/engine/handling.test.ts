import { describe, expect, it } from 'vitest';

import { DEFAULT_CONFIG } from '@/engine/config';
import { createHandling, tickHandling } from '@/engine/handling';
import { Input } from '@/engine/types';

describe('DAS / ARR', () => {
  it('moves immediately, then after 10 frames, then every 2 frames', () => {
    const h = createHandling();
    const moves: number[] = [];
    for (let f = 0; f < 20; f++) {
      const result = tickHandling(h, Input.Left, DEFAULT_CONFIG);
      if (result.count > 0) moves.push(f);
    }
    expect(moves[0]).toBe(0);
    expect(moves[1]).toBe(10);
    expect(moves[2]).toBe(12);
    expect(moves[3]).toBe(14);
  });

  it('does not move when both directions are held', () => {
    const h = createHandling();
    const result = tickHandling(h, Input.Left | Input.Right, DEFAULT_CONFIG);
    expect(result.count).toBe(0);
  });

  it('charges DAS again after a release', () => {
    const h = createHandling();
    tickHandling(h, Input.Left, DEFAULT_CONFIG);
    tickHandling(h, 0, DEFAULT_CONFIG);
    const again = tickHandling(h, Input.Left, DEFAULT_CONFIG);
    expect(again.count).toBe(1);
    expect(h.dasFrames).toBe(0);
  });
});
