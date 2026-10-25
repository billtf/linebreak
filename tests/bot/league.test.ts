import { describe, expect, it } from 'vitest';

import { botLevel } from '@/bot/levels';

describe('bot league', () => {
  it('defines five rising PPS levels', () => {
    expect(botLevel(1).pps).toBe(0.5);
    expect(botLevel(5).pps).toBe(2.5);
    expect(botLevel(5).lookahead).toBeGreaterThanOrEqual(botLevel(1).lookahead);
  });
});
