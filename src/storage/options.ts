import { DEFAULT_CONFIG, loadConfig, type Config } from '@/engine';

import { readJson, writeJson } from './local';

export interface Options {
  version: 1;
  gameplay: {
    boardWidth: number;
    queueLength: number;
    hold: boolean;
    allow180: boolean;
  };
  handling: {
    dasMs: number;
    arrMs: number;
    dcdMs: number;
    softDropFactor: number;
    hardDropGuardMs: number;
  };
  a11y: { reducedMotion: 'system' | 'on' | 'off' };
  assists: { undo: boolean; gravityScale: number; landingPreview: boolean };
}

export const DEFAULT_OPTIONS: Options = {
  version: 1,
  gameplay: {
    boardWidth: 10,
    queueLength: 5,
    hold: true,
    allow180: true,
  },
  handling: {
    dasMs: 167,
    arrMs: 33,
    dcdMs: 0,
    softDropFactor: 20,
    hardDropGuardMs: 0,
  },
  a11y: { reducedMotion: 'system' },
  assists: { undo: false, gravityScale: 1, landingPreview: false },
};

const KEY = 'lb:v1:options';

export function loadOptions(): Options {
  const raw = readJson<Partial<Options>>(KEY, DEFAULT_OPTIONS);
  try {
    return {
      ...DEFAULT_OPTIONS,
      ...raw,
      version: 1,
      gameplay: { ...DEFAULT_OPTIONS.gameplay, ...raw.gameplay },
      handling: { ...DEFAULT_OPTIONS.handling, ...raw.handling },
      a11y: { ...DEFAULT_OPTIONS.a11y, ...raw.a11y },
      assists: { ...DEFAULT_OPTIONS.assists, ...raw.assists },
    };
  } catch {
    return DEFAULT_OPTIONS;
  }
}

export function saveOptions(options: Options): void {
  writeJson(KEY, options);
}

export function toConfig(options: Options, modeId: string): Config {
  const width = modeId === 'daily' ? 10 : options.gameplay.boardWidth;
  return loadConfig({
    board: { width, visibleHeight: 20, bufferHeight: 20 },
    pieces: {
      ...DEFAULT_CONFIG.pieces,
      previewCount: options.gameplay.queueLength,
      holdEnabled: options.gameplay.hold,
      allow180: options.gameplay.allow180,
    },
    handling: {
      dasMs: options.handling.dasMs,
      arrMs: options.handling.arrMs,
      dcdMs: options.handling.dcdMs,
      hardDropGuardMs: options.handling.hardDropGuardMs,
    },
    timing: {
      ...DEFAULT_CONFIG.timing,
      softDropFactor: options.handling.softDropFactor,
    },
    assists: {
      undo: options.assists.undo,
      gravityScale: options.assists.gravityScale,
      ghost: true,
    },
    modifiers: modeId === 'zen' ? ['zen'] : [],
  });
}

export function reducedMotionOn(options: Options): boolean {
  if (options.a11y.reducedMotion === 'on') return true;
  if (options.a11y.reducedMotion === 'off') return false;
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
