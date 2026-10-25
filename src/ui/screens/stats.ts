import { lastN, summarize, type GameRecord } from '@/storage/history';

export function statsScreen(records: GameRecord[]): string {
  const recent = lastN(records, 30);
  const all = summarize(records);
  const maxScore = Math.max(1, ...recent.map((r) => r.score));
  const bars = recent
    .map((r) => {
      const h = Math.max(2, Math.round((r.score / maxScore) * 48));
      return `<i title="${r.mode} ${r.score}" style="height:${h}px"></i>`;
    })
    .join('');
  const mix = Object.entries(all.clears)
    .map(([k, n]) => `${k} ${n}`)
    .join(' · ');
  return `
    <div class="panel wide">
      <h2>Stats</h2>
      <p class="stat">${all.games} games · avg score ${Math.round(all.avgScore)} · ${all.avgPps.toFixed(2)} PPS</p>
      <p class="muted">${mix || 'No clears yet'}</p>
      <div class="trend" aria-label="Last 30 scores">${bars}</div>
      <button type="button" data-act="quit">Back</button>
    </div>`;
}
