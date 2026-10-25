import { formatTime, piecesPerSecond } from '@/render/hud';

import type { ModeResult } from '@/modes/mode';

export function resultsScreen(
  result: ModeResult,
  pbDelta: number,
  lockCount: number,
): string {
  const sec = result.frames / 60;
  const sign = pbDelta >= 0 ? '+' : '';
  return `
    <div class="panel">
      <h2>${result.won ? 'Clear' : 'Top out'}</h2>
      <p class="stat">Score ${result.score} <span class="muted">${sign}${pbDelta} PB</span></p>
      <p class="stat">Lines ${result.lines} · ${formatTime(sec)} · ${piecesPerSecond(lockCount, sec).toFixed(2)} PPS</p>
      ${result.stars ? `<p class="stat">${'★'.repeat(result.stars)}${'☆'.repeat(3 - result.stars)}</p>` : ''}
      ${result.tags?.length ? `<p class="muted">${result.tags.join(' · ')}</p>` : ''}
      <button type="button" data-act="retry" autofocus>Retry</button>
      <button type="button" data-act="quit">Title</button>
    </div>`;
}
