import { Input } from '@/engine';

/** Standard mapping → engine bits. */
export function pollGamepad(pad: Gamepad | null): number {
  if (!pad) return 0;
  const b = pad.buttons;
  const axes = pad.axes;
  let held = 0;
  const pressed = (i: number) => b[i]?.pressed ?? false;
  if (pressed(14) || (axes[0] ?? 0) < -0.5) held |= Input.Left;
  if (pressed(15) || (axes[0] ?? 0) > 0.5) held |= Input.Right;
  if (pressed(13) || (axes[1] ?? 0) > 0.5) held |= Input.SoftDrop;
  if (pressed(12) || (axes[1] ?? 0) < -0.5) held |= Input.HardDrop;
  if (pressed(0)) held |= Input.RotateCW;
  if (pressed(1)) held |= Input.RotateCCW;
  if (pressed(3)) held |= Input.Rotate180;
  if (pressed(4) || pressed(5)) held |= Input.Hold;
  return held;
}

export function firstGamepad(): Gamepad | null {
  const pads = navigator.getGamepads?.() ?? [];
  for (const pad of pads) {
    if (pad) return pad;
  }
  return null;
}
