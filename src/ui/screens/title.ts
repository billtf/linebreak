export function titleScreen(): string {
  return `
    <div class="panel">
      <h1>Linebreak</h1>
      <p>A falling-block puzzle. Keyboard only.</p>
      <button type="button" data-act="play" autofocus>Play Marathon</button>
      <p class="hint">← → move · ↑ / X rotate · Z CCW · Space hard drop · C hold · Esc pause</p>
    </div>`;
}
