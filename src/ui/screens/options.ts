import type { Options } from '@/storage/options';

export function optionsScreen(options: Options, tab = 'gameplay'): string {
  const width = options.gameplay.boardWidth;
  return `
    <div class="panel wide">
      <h2>Options</h2>
      <div class="tabs">
        <button type="button" data-tab="gameplay" ${tab === 'gameplay' ? 'class="on"' : ''}>Gameplay</button>
        <button type="button" data-tab="handling" ${tab === 'handling' ? 'class="on"' : ''}>Handling</button>
        <button type="button" data-tab="a11y" ${tab === 'a11y' ? 'class="on"' : ''}>Access</button>
        <button type="button" data-tab="assists" ${tab === 'assists' ? 'class="on"' : ''}>Assists</button>
        <button type="button" data-tab="data" ${tab === 'data' ? 'class="on"' : ''}>Data</button>
      </div>
      ${
        tab === 'gameplay'
          ? `<label>Board width ${width}
            <input data-opt="gameplay.boardWidth" type="range" min="6" max="16" value="${width}" />
            <span class="muted">presets 6 8 10 12 16 · applies next game</span>
          </label>
          <label>Queue <input data-opt="gameplay.queueLength" type="number" min="1" max="6" value="${options.gameplay.queueLength}" /></label>
          <label><input data-opt="gameplay.hold" type="checkbox" ${options.gameplay.hold ? 'checked' : ''}/> Hold</label>
          <label><input data-opt="gameplay.allow180" type="checkbox" ${options.gameplay.allow180 ? 'checked' : ''}/> 180 rotation</label>`
          : ''
      }
      ${
        tab === 'handling'
          ? `<label>DAS ms <input data-opt="handling.dasMs" type="number" min="0" max="400" value="${options.handling.dasMs}" /></label>
          <label>ARR ms <input data-opt="handling.arrMs" type="number" min="0" max="100" value="${options.handling.arrMs}" /></label>
          <label>DCD ms <input data-opt="handling.dcdMs" type="number" min="0" max="100" value="${options.handling.dcdMs}" /></label>
          <label>Soft drop × <input data-opt="handling.softDropFactor" type="number" min="5" max="40" value="${options.handling.softDropFactor}" /></label>`
          : ''
      }
      ${
        tab === 'a11y'
          ? `<label>Reduced motion
            <select data-opt="a11y.reducedMotion">
              <option value="system" ${options.a11y.reducedMotion === 'system' ? 'selected' : ''}>System</option>
              <option value="on" ${options.a11y.reducedMotion === 'on' ? 'selected' : ''}>On</option>
              <option value="off" ${options.a11y.reducedMotion === 'off' ? 'selected' : ''}>Off</option>
            </select>
          </label>`
          : ''
      }
      ${
        tab === 'assists'
          ? `<label><input data-opt="assists.undo" type="checkbox" ${options.assists.undo ? 'checked' : ''}/> Undo last piece (Ctrl+Z)</label>
          <label>Gravity scale <input data-opt="assists.gravityScale" type="number" min="0.1" max="2" step="0.1" value="${options.assists.gravityScale}" /></label>`
          : ''
      }
      ${
        tab === 'data'
          ? `<button type="button" data-act="export">Export save</button>
          <button type="button" data-act="import">Import save</button>
          <button type="button" data-act="reset-data">Reset all</button>`
          : ''
      }
      <button type="button" data-act="close-options">Back</button>
    </div>`;
}

export function applyOption(
  options: Options,
  path: string,
  value: string | boolean,
): Options {
  const next: Options = structuredClone(options);
  if (path === 'gameplay.boardWidth')
    next.gameplay.boardWidth = clamp(Number(value), 6, 16);
  if (path === 'gameplay.queueLength')
    next.gameplay.queueLength = clamp(Number(value), 1, 6);
  if (path === 'gameplay.hold') next.gameplay.hold = Boolean(value);
  if (path === 'gameplay.allow180') next.gameplay.allow180 = Boolean(value);
  if (path === 'handling.dasMs')
    next.handling.dasMs = clamp(Number(value), 0, 400);
  if (path === 'handling.arrMs')
    next.handling.arrMs = clamp(Number(value), 0, 100);
  if (path === 'handling.dcdMs')
    next.handling.dcdMs = clamp(Number(value), 0, 100);
  if (path === 'handling.softDropFactor')
    next.handling.softDropFactor = clamp(Number(value), 5, 40);
  if (
    path === 'a11y.reducedMotion' &&
    (value === 'system' || value === 'on' || value === 'off')
  ) {
    next.a11y.reducedMotion = value;
  }
  if (path === 'assists.undo') next.assists.undo = Boolean(value);
  if (path === 'assists.gravityScale')
    next.assists.gravityScale = clamp(Number(value), 0.1, 2);
  return next;
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}
