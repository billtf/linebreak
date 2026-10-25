import { describe, expect, it } from 'vitest';

import { computeLayout } from '@/render/layout';

describe('layout', () => {
  it('sizes cells from the spec formula', () => {
    const layout = computeLayout(1366, 768, 10);
    const expected = Math.floor(Math.min(1366 / 20, 768 / 22));
    expect(layout.cell).toBe(expected);
    expect(layout.collapsed).toBe(false);
  });

  it('collapses side panels when cells drop under 14 px', () => {
    const layout = computeLayout(360, 640, 16);
    expect(layout.cell).toBeLessThan(14);
    expect(layout.collapsed).toBe(true);
  });
});
