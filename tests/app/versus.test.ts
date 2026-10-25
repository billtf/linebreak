import { describe, expect, it } from 'vitest';

import { createGame, loadConfig } from '@/engine';
import { createVersusMatch, versusOnEvents } from '@/modes/versus';
import { versusFits } from '@/render/versus';
import { P1_MAP, P2_MAP } from '@/input/players';
import { Input } from '@/engine';

describe('versus garbage', () => {
  it('cancels then queues leftover on the opponent', () => {
    const cfg = loadConfig();
    const a = createGame(1, cfg);
    const b = createGame(1, cfg);
    const match = createVersusMatch();
    versusOnEvents(
      match,
      0,
      [
        {
          t: 'clear',
          rows: [1],
          kind: 'quad',
          b2b: false,
          combo: 1,
          points: 800,
        },
      ],
      b,
      cfg,
    );
    expect(match.incoming[1]).toBe(4);
    versusOnEvents(match, 0, [{ t: 'lock', cells: [] }], b, cfg);
    expect(match.incoming[1]).toBe(0);
    expect(a.score).toBeGreaterThanOrEqual(0);
  });
});

describe('local 2p maps', () => {
  it('does not share movement keys', () => {
    expect(P1_MAP['ArrowLeft']).toBeUndefined();
    expect(P2_MAP['KeyA']).toBeUndefined();
    expect(P1_MAP['KeyA']).toBe(Input.Left);
    expect(P2_MAP['ArrowLeft']).toBe(Input.Left);
  });

  it('fits two boards at 1366', () => {
    expect(versusFits(1366)).toBe(true);
  });
});
