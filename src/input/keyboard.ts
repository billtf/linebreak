import { Input } from '@/engine';

const GAME_CODES = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowDown',
  'ArrowUp',
  'Space',
  'KeyX',
  'KeyZ',
  'KeyA',
  'KeyC',
  'ShiftLeft',
  'ShiftRight',
  'Escape',
  'KeyP',
  'KeyR',
  'Enter',
]);

export const DEFAULT_MAP: Record<string, number> = {
  ArrowLeft: Input.Left,
  ArrowRight: Input.Right,
  ArrowDown: Input.SoftDrop,
  Space: Input.HardDrop,
  ArrowUp: Input.RotateCW,
  KeyX: Input.RotateCW,
  KeyZ: Input.RotateCCW,
  KeyA: Input.Rotate180,
  KeyC: Input.Hold,
  ShiftLeft: Input.Hold,
  ShiftRight: Input.Hold,
};

export function codeToInput(
  code: string,
  map: Record<string, number> = DEFAULT_MAP,
): number {
  return map[code] ?? 0;
}

export interface Keyboard {
  held: number;
  pause: boolean;
  restartHeldMs: number;
  attach(): void;
  detach(): void;
  consumePause(): boolean;
}

export function createKeyboard(
  target: Window = window,
  map: Record<string, number> = DEFAULT_MAP,
): Keyboard {
  let held = 0;
  let pause = false;
  let restartHeldMs = 0;
  let restartDown = false;
  let last = 0;

  function onKeyDown(event: KeyboardEvent): void {
    if (GAME_CODES.has(event.code)) event.preventDefault();
    if (event.repeat) return;
    if (event.code === 'Escape' || event.code === 'KeyP') {
      pause = true;
      return;
    }
    if (event.code === 'KeyR') {
      restartDown = true;
      return;
    }
    held |= codeToInput(event.code, map);
  }

  function onKeyUp(event: KeyboardEvent): void {
    if (GAME_CODES.has(event.code)) event.preventDefault();
    if (event.code === 'KeyR') {
      restartDown = false;
      restartHeldMs = 0;
      return;
    }
    held &= ~codeToInput(event.code, map);
  }

  function onBlur(): void {
    held = 0;
    restartDown = false;
    restartHeldMs = 0;
  }

  function tickRestart(now: number): void {
    const dt = last ? now - last : 0;
    last = now;
    if (restartDown) restartHeldMs += dt;
    else restartHeldMs = 0;
  }

  const keyboard: Keyboard = {
    get held() {
      tickRestart(performance.now());
      return held;
    },
    get pause() {
      return pause;
    },
    get restartHeldMs() {
      tickRestart(performance.now());
      return restartHeldMs;
    },
    attach() {
      target.addEventListener('keydown', onKeyDown);
      target.addEventListener('keyup', onKeyUp);
      target.addEventListener('blur', onBlur);
    },
    detach() {
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('keyup', onKeyUp);
      target.removeEventListener('blur', onBlur);
    },
    consumePause() {
      const value = pause;
      pause = false;
      return value;
    },
  };
  return keyboard;
}
