import { describe, expect, it } from 'vitest';

import { applyOption } from '@/ui/screens/options';
import { DEFAULT_OPTIONS, toConfig } from '@/storage/options';

describe('modifiers', () => {
  it('maps onto config and disables hold', () => {
    let options = applyOption(
      DEFAULT_OPTIONS,
      'gameplay.modifier.mirror',
      true,
    );
    options = applyOption(options, 'gameplay.modifier.noHold', true);
    options = applyOption(options, 'gameplay.modifier.rising', true);
    const cfg = toConfig(options, 'sprint');
    expect(cfg.modifiers).toEqual(expect.arrayContaining(['mirror', 'rising']));
    expect(cfg.modifiers).not.toContain('noHold');
    expect(cfg.pieces.holdEnabled).toBe(false);
  });
});
