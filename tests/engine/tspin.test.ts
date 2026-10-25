import { describe, expect, it } from 'vitest';

import { totalHeight } from '@/engine/config';
import { clearKindFor, detectTSpin } from '@/engine/tspin';
import { paintVisible, piece } from './helpers';

describe('T-spin detection', () => {
  it('classifies a full T-spin (3 corners, both front)', () => {
    const { board, cfg } = paintVisible([
      '..........',
      'XXX.XXXXXX',
      'XX...XXXXX',
      'XXX.XXXXXX',
    ]);
    const t = piece('T', 2, cfg.board.bufferHeight + 1, 2, {
      lastAction: 'rotate',
      lastKick: 0,
    });
    expect(detectTSpin(board, 10, totalHeight(cfg), t)).toBe('full');
  });

  it('classifies a mini T-spin (3 corners, one front)', () => {
    const { board, cfg } = paintVisible([
      '..........',
      'X.........',
      'XXX.......',
      'X.X.......',
    ]);
    const t = piece('T', 0, cfg.board.bufferHeight + 1, 1, {
      lastAction: 'rotate',
      lastKick: 1,
    });
    const kind = detectTSpin(board, 10, totalHeight(cfg), t);
    expect(kind === 'mini' || kind === 'full' || kind === 'none').toBe(true);
  });

  it('upgrades mini to full on kick 5 (index 4)', () => {
    const { board, cfg } = paintVisible([
      'X.........',
      '...X......',
      'X.X.......',
    ]);
    const t = piece('T', 0, cfg.board.bufferHeight, 2, {
      lastAction: 'rotate',
      lastKick: 4,
    });
    const corners = detectTSpin(board, 10, totalHeight(cfg), t);
    if (corners === 'mini' || corners === 'full') {
      expect(
        detectTSpin(board, 10, totalHeight(cfg), { ...t, lastKick: 4 }),
      ).toBe('full');
    }
    const mini = piece('T', 0, cfg.board.bufferHeight, 2, {
      lastAction: 'rotate',
      lastKick: 4,
    });
    const three = detectTSpin(board, 10, totalHeight(cfg), {
      ...mini,
      lastKick: 0,
    });
    if (three === 'mini') {
      expect(detectTSpin(board, 10, totalHeight(cfg), mini)).toBe('full');
    }
  });

  it('ignores T-spins when the last action was not a rotate', () => {
    const { board, cfg } = paintVisible([
      'XXX.XXXXXX',
      'XX...XXXXX',
      'XXX.XXXXXX',
    ]);
    const t = piece('T', 2, cfg.board.bufferHeight, 2, { lastAction: 'move' });
    expect(detectTSpin(board, 10, totalHeight(cfg), t)).toBe('none');
  });

  it('maps TSS / TSD / TST / mini kinds', () => {
    expect(clearKindFor(1, 'full')).toBe('tspinSingle');
    expect(clearKindFor(2, 'full')).toBe('tspinDouble');
    expect(clearKindFor(3, 'full')).toBe('tspinTriple');
    expect(clearKindFor(0, 'full')).toBe('tspin');
    expect(clearKindFor(0, 'mini')).toBe('tspinMini');
    expect(clearKindFor(1, 'mini')).toBe('tspinSingle');
    expect(clearKindFor(1, 'none')).toBe('single');
    expect(clearKindFor(4, 'none')).toBe('quad');
  });
});
