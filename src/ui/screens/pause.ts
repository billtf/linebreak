export function pauseScreen(): string {
  return `
    <div class="panel">
      <h2>Paused</h2>
      <button type="button" data-act="resume" autofocus>Resume</button>
        <button type="button" data-act="retry">Restart</button>
        <button type="button" data-act="options">Options</button>
        <button type="button" data-act="quit">Quit</button>
    </div>`;
}
