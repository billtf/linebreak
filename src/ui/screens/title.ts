export function titleScreen(): string {
  return `
    <div class="panel">
      <h1>Linebreak</h1>
      <p>A falling-block puzzle.</p>
      <button type="button" data-act="play" data-mode="marathon" autofocus>Marathon</button>
      <button type="button" data-act="play" data-mode="sprint">Sprint 40</button>
      <button type="button" data-act="play" data-mode="ultra">Ultra 2 min</button>
      <button type="button" data-act="play" data-mode="daily">Daily</button>
      <button type="button" data-act="play" data-mode="zen">Zen</button>
      <button type="button" data-act="versus">Versus CPU</button>
      <button type="button" data-act="local2p">Local 2P</button>
      <button type="button" data-act="puzzles">Puzzles</button>
      <button type="button" data-act="stats">Stats</button>
      <button type="button" data-act="options">Options</button>
      <p class="hint">← → move · ↑ / X rotate · Z CCW · Space hard drop · C hold · Esc pause</p>
    </div>`;
}
