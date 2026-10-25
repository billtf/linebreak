import { dailySeed } from '@/modes/daily';

export function dailyShareCard(
  score: number,
  lines: number,
  date = new Date(),
): string {
  return `Linebreak Daily ${dailySeed(date)}\nScore ${score} · Lines ${lines}`;
}
