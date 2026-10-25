import { Input } from '@/engine';

export const P1_MAP: Record<string, number> = {
  KeyA: Input.Left,
  KeyD: Input.Right,
  KeyS: Input.SoftDrop,
  KeyW: Input.HardDrop,
  KeyG: Input.RotateCW,
  KeyF: Input.RotateCCW,
  KeyT: Input.Rotate180,
  KeyC: Input.Hold,
};

export const P2_MAP: Record<string, number> = {
  ArrowLeft: Input.Left,
  ArrowRight: Input.Right,
  ArrowDown: Input.SoftDrop,
  Space: Input.HardDrop,
  ArrowUp: Input.RotateCW,
  KeyK: Input.RotateCCW,
  KeyL: Input.Rotate180,
  ShiftRight: Input.Hold,
};

export function mergeHeld(a: number, b: number): [number, number] {
  return [a, b];
}
