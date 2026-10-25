import { describe, expect, it } from 'vitest';

import { createPrng, nextFloat, nextU32 } from '@/engine/prng';
import { createRngState, peekSequence, takePiece } from '@/engine/randomizer';
import { ALL_PIECES, type PieceType } from '@/engine/types';

describe('prng + 7-bag', () => {
  it('is deterministic for 10,000 pieces', () => {
    const a = createRngState(12345);
    const b = createRngState(12345);
    const seqA: PieceType[] = [];
    const seqB: PieceType[] = [];
    for (let i = 0; i < 10_000; i++) {
      seqA.push(takePiece(a, ALL_PIECES));
      seqB.push(takePiece(b, ALL_PIECES));
    }
    expect(seqA).toEqual(seqB);
    expect(seqA).toEqual(
      peekSequence(createRngState(12345), 10_000, ALL_PIECES),
    );
  });

  it('puts each piece once in every bag of 7', () => {
    const state = createRngState(99);
    for (let bag = 0; bag < 200; bag++) {
      const seven = [
        takePiece(state, ALL_PIECES),
        takePiece(state, ALL_PIECES),
        takePiece(state, ALL_PIECES),
        takePiece(state, ALL_PIECES),
        takePiece(state, ALL_PIECES),
        takePiece(state, ALL_PIECES),
        takePiece(state, ALL_PIECES),
      ];
      expect(new Set(seven).size).toBe(7);
    }
  });

  it('a different seed yields a different sequence', () => {
    const a = peekSequence(createRngState(1), 20, ALL_PIECES);
    const b = peekSequence(createRngState(2), 20, ALL_PIECES);
    expect(a).not.toEqual(b);
  });

  it('mulberry32 stays in uint32', () => {
    const rng = createPrng(1);
    for (let i = 0; i < 100; i++) {
      const n = nextU32(rng);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(2 ** 32);
      expect(nextFloat(rng)).toBeGreaterThanOrEqual(0);
      expect(nextFloat(rng)).toBeLessThan(1);
    }
  });
});
