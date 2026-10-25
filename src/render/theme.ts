import type { PieceType } from '@/engine';

/** Original muted palette — not guideline piece colors. */
export const PIECE_COLORS: Record<PieceType, string> = {
  I: '#4aa3a2',
  O: '#c4a35a',
  T: '#8b6bb5',
  S: '#6d9b6c',
  Z: '#c4716a',
  J: '#4f6f9c',
  L: '#c4845a',
};

export const THEME = {
  bg: '#121212',
  board: '#1a1a1a',
  grid: '#2a2a2a',
  panel: '#181818',
  text: '#e8e6e3',
  muted: '#9a968e',
  danger: 'rgba(180, 60, 50, 0.28)',
  ghost: 'rgba(232, 230, 227, 0.22)',
  flash: 'rgba(255, 255, 255, 0.72)',
  lock: 'rgba(255, 255, 255, 0.45)',
};
