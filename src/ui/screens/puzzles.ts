import type { Puzzle } from '@/modes/puzzle/schema';
import { tierUnlocked, type PuzzleStars } from '@/storage/puzzles';

export function puzzlesScreen(puzzles: Puzzle[], stars: PuzzleStars): string {
  const ids = puzzles.map((p) => p.id);
  const tiers = [1, 2, 3, 4];
  return `
    <div class="panel wide">
      <h2>Puzzles</h2>
      ${tiers
        .map((tier) => {
          const unlocked = tierUnlocked(stars, tier, ids);
          const list = puzzles.filter((p) => p.tier === tier);
          const earned = list.reduce((s, p) => s + (stars[p.id] ?? 0), 0);
          return `<h3>Tier ${tier} · ${earned}/${list.length * 3}</h3>
          ${
            unlocked
              ? list
                  .map((p) => {
                    const n = stars[p.id] ?? 0;
                    const mark = '★'.repeat(n) + '☆'.repeat(3 - n);
                    return `<button type="button" data-act="play" data-mode="puzzle" data-puzzle="${p.id}">${p.title} <span class="muted">${mark}</span></button>`;
                  })
                  .join('')
              : `<p class="muted">Earn 10 stars in tier ${tier - 1} to unlock.</p>`
          }`;
        })
        .join('')}
      <button type="button" data-act="quit">Back</button>
    </div>`;
}
