import type { GameEvent } from '@/engine';

export interface Effects {
  lockFlash: number;
  clearRows: number[];
  clearFlash: number;
  callout: string;
  calloutT: number;
  reducedMotion: boolean;
  onEvent(e: GameEvent): void;
  tick(): void;
}

export function createEffects(reducedMotion = false): Effects {
  const fx: Effects = {
    lockFlash: 0,
    clearRows: [],
    clearFlash: 0,
    callout: '',
    calloutT: 0,
    reducedMotion,
    onEvent(e) {
      if (e.t === 'lock') {
        fx.lockFlash = reducedMotion ? 0 : 1;
      }
      if (e.t === 'clear') {
        fx.clearRows = e.rows.slice();
        fx.clearFlash = reducedMotion ? 0 : 9;
        const label: Record<string, string> = {
          single: 'SINGLE',
          double: 'DOUBLE',
          triple: 'TRIPLE',
          quad: 'QUAD',
          tspinMini: 'MINI',
          tspin: 'T-SPIN',
          tspinSingle: 'TSS',
          tspinDouble: 'TSD',
          tspinTriple: 'TST',
          perfectClear: 'PERFECT',
        };
        fx.callout = label[e.kind] ?? e.kind.toUpperCase();
        if (e.b2b) fx.callout = `B2B ${fx.callout}`;
        fx.calloutT = reducedMotion ? 0 : 45;
      }
    },
    tick() {
      if (fx.lockFlash > 0) fx.lockFlash -= 1;
      if (fx.clearFlash > 0) fx.clearFlash -= 1;
      else fx.clearRows = [];
      if (fx.calloutT > 0) fx.calloutT -= 1;
      else fx.callout = '';
    },
  };
  return fx;
}
