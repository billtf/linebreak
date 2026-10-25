import { registerSW } from 'virtual:pwa-register';

import {
  cloneState,
  createGame,
  ghostY,
  step,
  visibleTop,
  type Config,
  type GameState,
} from '@/engine';

import { formatDebug, frameP95, isDebug, recordFrame } from './debug';
import { firstGamepad, pollGamepad } from './input/gamepad';
import { createKeyboard } from './input/keyboard';
import { createLoop } from './loop';
import { modeById } from './modes/catalog';
import { dailyShareCard } from './ui/share';
import type { Mode, ModeResult } from './modes/mode';
import { renderBoard } from './render/canvas';
import { createEffects } from './render/effects';
import { renderHud } from './render/hud';
import { computeLayout } from './render/layout';
import { THEME } from './render/theme';
import { exportSave, importSave, resetSave } from './storage/data';
import { writePbIfBetter, type PersonalBest } from './storage/local';
import {
  loadOptions,
  reducedMotionOn,
  saveOptions,
  toConfig,
  type Options,
} from './storage/options';
import { createRouter } from './ui/router';
import { applyOption, optionsScreen } from './ui/screens/options';
import { pauseScreen } from './ui/screens/pause';
import { resultsScreen } from './ui/screens/results';
import { titleScreen } from './ui/screens/title';

const app = document.querySelector('#app');
if (!app) throw new Error('#app root is missing');

app.innerHTML = `
  <canvas id="game" aria-label="Linebreak playfield"></canvas>
  <div id="overlay" class="overlay"></div>
  <div id="live" class="live" aria-live="polite"></div>
  <div id="debug" class="debug" hidden></div>
`;

const canvasEl = document.querySelector<HTMLCanvasElement>('#game');
const overlayEl = document.querySelector<HTMLDivElement>('#overlay');
const liveEl = document.querySelector<HTMLDivElement>('#live');
const debugNode = document.querySelector<HTMLDivElement>('#debug');
if (!canvasEl || !overlayEl || !liveEl || !debugNode) {
  throw new Error('UI roots missing');
}
const canvas: HTMLCanvasElement = canvasEl;
const overlay: HTMLDivElement = overlayEl;
const live: HTMLDivElement = liveEl;
const debugEl: HTMLDivElement = debugNode;

const gfx = canvas.getContext('2d');
if (!gfx) throw new Error('canvas 2d unavailable');
const ctx: CanvasRenderingContext2D = gfx;

const debug = isDebug();
const router = createRouter('title');
const keyboard = createKeyboard();
let options: Options = loadOptions();
let fx = createEffects(reducedMotionOn(options));
let cfg: Config = toConfig(options, 'marathon');
let mode: Mode = modeById('marathon');
let optionsTab = 'gameplay';
let optionsReturn: 'title' | 'pause' = 'title';
const undoBuf: GameState[] = [];

let state: GameState | null = null;
let result: ModeResult | null = null;
let pbDelta = 0;
let startedAt = 0;
let lockCount = 0;
let lastFrame = 0;

function overlayHtml(): string {
  if (router.screen === 'title') return titleScreen();
  if (router.screen === 'pause') return pauseScreen();
  if (router.screen === 'options') return optionsScreen(options, optionsTab);
  if (router.screen === 'results' && result) {
    return resultsScreen(result, pbDelta, lockCount);
  }
  return '';
}

function paintOverlay(): void {
  overlay.innerHTML = overlayHtml();
  overlay.hidden = router.screen === 'play';
  overlay.querySelector<HTMLButtonElement>('button[autofocus]')?.focus();
}

function startGame(modeId?: string): void {
  mode = modeById(modeId ?? mode.id);
  cfg = mode.config(toConfig(options, mode.id), {});
  fx = createEffects(reducedMotionOn(options));
  state = createGame(mode.seed(), cfg);
  result = null;
  lockCount = 0;
  undoBuf.length = 0;
  startedAt = performance.now();
  fx.lockFlash = 0;
  fx.clearFlash = 0;
  router.go('play');
  paintOverlay();
}

function finish(next: ModeResult): void {
  result = next;
  const rec: PersonalBest = {
    score: next.score,
    lines: next.lines,
    frames: next.frames,
  };
  const assisted = options.assists.undo || options.assists.gravityScale !== 1;
  const saved = assisted
    ? { pb: rec, delta: 0, isNew: false }
    : writePbIfBetter(mode.pbKey(cfg), rec);
  pbDelta = saved.delta;
  if (mode.id === 'daily') {
    void navigator.clipboard.writeText(dailyShareCard(next.score, next.lines));
  }
  router.go('results');
  paintOverlay();
}

function resize(): void {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function draw(now: number): void {
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.fillStyle = THEME.bg;
  ctx.fillRect(0, 0, w, h);
  if (!state) return;
  const layout = computeLayout(w, h, state.width);
  const ghost = ghostY(state, cfg);
  renderBoard(ctx, state, layout, ghost, fx, visibleTop(cfg));
  const elapsed = startedAt ? (now - startedAt) / 1000 : 0;
  renderHud(ctx, state, layout, fx, elapsed);
  if (debug) {
    const dt = lastFrame ? now - lastFrame : 0;
    recordFrame(dt);
    debugEl.hidden = false;
    debugEl.textContent = formatDebug(frameP95(), dt > 0 ? 1000 / dt : 0);
  }
  lastFrame = now;
}

function tick(): void {
  if (router.screen !== 'play' || !state) return;
  if (document.hidden) {
    router.go('pause');
    paintOverlay();
    return;
  }
  if (keyboard.consumePause()) {
    router.go('pause');
    paintOverlay();
    return;
  }
  if (keyboard.restartHeldMs >= 500) {
    startGame();
    return;
  }
  const held = keyboard.held | pollGamepad(firstGamepad());
  const { events } = step(state, held, cfg);
  for (const event of events) {
    fx.onEvent(event);
    mode.onEvent(event, state);
    if (event.t === 'lock') {
      lockCount += 1;
      if (options.assists.undo) {
        undoBuf.push(cloneState(state));
        if (undoBuf.length > 20) undoBuf.shift();
      }
    }
    if (
      event.t === 'clear' &&
      event.kind !== 'tspin' &&
      event.kind !== 'tspinMini'
    ) {
      live.textContent = event.kind;
    }
    if (event.t === 'topOut') live.textContent = 'top out';
  }
  fx.tick();
  const ended = mode.result(state);
  if (ended) finish(ended);
}

overlay.addEventListener('click', (event) => {
  const btn = (event.target as HTMLElement).closest<HTMLButtonElement>(
    'button[data-act]',
  );
  if (!btn) return;
  const act = btn.dataset['act'];
  if (act === 'play' || act === 'retry') {
    startGame(btn.dataset['mode'] ?? mode.id);
  }
  if (act === 'resume') {
    router.go('play');
    paintOverlay();
  }
  if (act === 'options') {
    optionsReturn = router.screen === 'pause' ? 'pause' : 'title';
    router.go('options');
    paintOverlay();
  }
  if (act === 'close-options') {
    router.go(optionsReturn);
    paintOverlay();
  }
  if (act === 'export') {
    void navigator.clipboard.writeText(exportSave());
    live.textContent = 'save copied';
  }
  if (act === 'import') {
    const raw = prompt('Paste save JSON');
    if (raw) {
      try {
        importSave(raw);
        options = loadOptions();
        live.textContent = 'save imported';
      } catch {
        live.textContent = 'import failed';
      }
    }
  }
  if (act === 'reset-data' && confirm('Reset all Linebreak data?')) {
    resetSave();
    options = loadOptions();
    paintOverlay();
  }
  if (act === 'quit') {
    state = null;
    router.go('title');
    paintOverlay();
  }
});

overlay.addEventListener('input', (event) => {
  const el = event.target as HTMLInputElement | HTMLSelectElement;
  const path = el.dataset['opt'];
  if (!path) return;
  const value =
    el instanceof HTMLInputElement && el.type === 'checkbox'
      ? el.checked
      : el.value;
  options = applyOption(options, path, value);
  saveOptions(options);
});

overlay.addEventListener('click', (event) => {
  const tabBtn = (event.target as HTMLElement).closest<HTMLButtonElement>(
    'button[data-tab]',
  );
  if (!tabBtn?.dataset['tab']) return;
  optionsTab = tabBtn.dataset['tab'];
  paintOverlay();
});

window.addEventListener('keydown', (event) => {
  if (
    router.screen === 'title' &&
    (event.code === 'Enter' || event.code === 'Space')
  ) {
    event.preventDefault();
    startGame();
  }
  if (
    router.screen === 'pause' &&
    (event.code === 'Enter' || event.code === 'Escape' || event.code === 'KeyP')
  ) {
    event.preventDefault();
    router.go('play');
    paintOverlay();
  }
  if (router.screen === 'results' && event.code === 'Enter') {
    event.preventDefault();
    startGame();
  }
  if (
    options.assists.undo &&
    router.screen === 'play' &&
    event.code === 'KeyZ' &&
    (event.ctrlKey || event.metaKey)
  ) {
    event.preventDefault();
    const prev = undoBuf.pop();
    if (prev) state = prev;
  }
});

keyboard.attach();
window.addEventListener('resize', resize);
resize();
paintOverlay();

createLoop(60, tick, (now) => {
  draw(now);
}).start();

registerSW({ immediate: true });
