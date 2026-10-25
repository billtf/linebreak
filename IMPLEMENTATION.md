# Linebreak Implementation Plan

Oct 24, 2026 · @bc

## Plan at a glance

Linebreak ships v1 in about 104 hours of work across Phases 0 to 3, and v1.2 in about 160 hours total; at 10 hours a week that is roughly 11 weeks to v1 and 16 weeks to v1.2.

| Phase | Outcome | Tasks | Effort (h) | Gate to exit |
| --- | --- | --- | --- | --- |
| 0 | Repo, CI, Pages deploy live | 7 | 6 | G0: placeholder live at the Pages URL, CI required on `main` |
| 1 | Headless engine, fully tested | 13 | 30 | G1: coverage ≥ 90%, 10,000 piece determinism test passes |
| 2 | Playable Marathon in the browser | 9 | 22 | G2: 60 fps on target Chromebook, 3 playtesters finish a game |
| 3 | v1 feature set, Options menu, board width | 16 | 46 | G3: Lighthouse ≥ 95, bundle < 150 KB, golden replays pass |
| 4 | v1.1: puzzles, modifiers, stats | 6 | 24 | G4: all 20 puzzles solved by their stored solution in CI |
| 5 | v1.2: CPU bot, Versus, local 2 player | 9 | 32 | G5: bot win rate rises with each difficulty level |

**Critical path:** core types (P1.1) → board (P1.5) → rotation (P1.6) → `step()` (P1.11) → game loop and renderer (P2.1, P2.3) → Options menu and width (P3.3 to P3.5). Audio, gamepad, touch, and PWA work runs in parallel once Phase 2 lands.

**One deviation from the spec:** DAS/ARR handling moves from `src/input/` into the engine (`src/engine/handling.ts`). Input code only reports which keys are held each tick; the engine converts that to moves in frames, so replays stay deterministic regardless of browser timing.

## Roadmap

&#91;embedded content: roadmap · 6 phases, 6 gates\]

Each phase must pass its gate before the next starts; G3 is the public v1 release, and Phases 4 and 5 each ship as their own point release.

## Working conventions

One task = one branch = one PR, merged only when CI is green and the task's "Done when" column is true.

| Area | Rule |
| --- | --- |
| Branches | `p1.6-srs-kicks` style: task ID plus short slug, cut from `main` |
| Commits | Conventional Commits (`feat(engine): add SRS kick tables`) |
| PR checks | Lint, typecheck, unit tests, golden replays (from Phase 1), bundle size (from Phase 2), Lighthouse (from Phase 3) |
| Engine purity | No imports from `src/render`, `src/ui`, `src/audio`, or DOM globals in `src/engine`; enforced with an ESLint `no-restricted-imports` rule |
| Randomness | Only the seeded PRNG; `Math.random` and `Date.now` banned in `src/engine` by lint rule |
| Config | Every tunable number comes from `Config`; no magic numbers in rules code |
| Tests | Every engine PR adds or updates tests; bug fixes start with a failing test |
| Versioning | `package.json` version bumps at each gate; tag `v0.1.0` at G1 through `v1.2.0` at G5 |

**Definition of done (every task)**

- [ ] Code merged to `main` and deployed to Pages
- [ ] Tests cover the new behavior
- [ ] No new lint warnings; bundle budget holds
- [ ] README or spec updated if behavior or config changed

**Using an AI coding agent:** hand it one task row at a time with the spec link, the task's files, and its Done when line. Phase 1 tasks are ideal for this because each has an exact test oracle.

## Phase 0: Repo and pipeline (6 h)

Phase 0 ends with a placeholder page live on GitHub Pages and every later PR blocked until CI passes.

| ID | Task | Files | Depends on | Est (h) | Done when |
| --- | --- | --- | --- | --- | --- |
| P0.1 | Create `linebreak` repo with MIT license, README stub, Node `.gitignore`, `.nvmrc` (Node 20) | `README.md`, `LICENSE`, `.nvmrc` | None | 0.5 | Repo exists, clones cleanly |
| P0.2 | Scaffold Vite vanilla TS; `strict`, `noUncheckedIndexedAccess`; `@/` path alias | `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.ts` | P0.1 | 1 | `npm run dev` serves a page |
| P0.3 | ESLint (typescript-eslint) + Prettier + husky + lint-staged; engine purity rules stubbed | `eslint.config.js`, `.prettierrc`, `.husky/` | P0.2 | 1 | `npm run lint` passes; bad import into `src/engine` fails |
| P0.4 | Vitest with v8 coverage; one sample test | `vitest.config.ts`, `tests/smoke.test.ts` | P0.2 | 0.5 | `npm test` passes with coverage report |
| P0.5 | `ci.yml`: install, lint, typecheck, test, build, `size-limit` check on every PR | `.github/workflows/ci.yml`, `.size-limit.json` | P0.3, P0.4 | 1.5 | Failing test turns the PR red |
| P0.6 | `deploy.yml` with `configure-pages`, `upload-pages-artifact`, `deploy-pages`; set `base: '/linebreak/'`; Pages source = GitHub Actions | `.github/workflows/deploy.yml`, `vite.config.ts` | P0.5 | 1 | Push to `main` updates the live URL within 2 minutes |
| P0.7 | Protect `main`: require CI, no direct pushes | Repo settings | P0.5 | 0.5 | Direct push to `main` is rejected |

**npm scripts to add in P0.2 to P0.5**

```json
{
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "lint": "eslint . && prettier --check .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run --coverage",
  "test:watch": "vitest",
  "size": "size-limit"
}
```

## Phase 1: Headless engine (30 h)

Phase 1 delivers the entire game rules as pure TypeScript that runs in Node with no browser, tested to 90% coverage.

| ID | Task | Files | Depends on | Est (h) | Done when |
| --- | --- | --- | --- | --- | --- |
| P1.1 | Core types (below) | `src/engine/types.ts` | P0 | 2 | Types compile; reviewed against spec |
| P1.2 | Default config, Zod schema, deep merge for mode overrides; `board.width` 6 to 16 | `src/engine/config.ts` | P1.1 | 2 | Invalid config (width 5, unknown key) throws with a clear message |
| P1.3 | mulberry32 PRNG; 7 bag randomizer with serializable state | `src/engine/prng.ts`, `randomizer.ts` | P1.1 | 1.5 | Same seed gives same 10,000 pieces; every bag of 7 holds each piece once |
| P1.4 | Piece shape tables for 4 rotation states; width aware spawn `floor((width − pieceWidth) / 2)` | `src/engine/pieces.ts` | P1.1 | 1.5 | Spawn columns correct for widths 6, 10, 16 |
| P1.5 | Board as flat `Uint8Array`: create, collides, place, clearLines, isEmpty | `src/engine/board.ts` | P1.4 | 2.5 | Clears 1 to 4 lines including non adjacent rows |
| P1.6 | SRS kick data (JLSTZ, I, 180); `tryRotate` returns new piece + kick index used | `src/engine/rotation.ts`, `data/kicks.ts` | P1.5 | 3 | Every kick test from the SRS tables passes as a test case |
| P1.7 | Gravity curve per level, 20G at level 20; fractional row accumulator; soft drop factor | `src/engine/gravity.ts` | P1.2 | 2 | Level 1 drops 1 row per 60 ticks; level 20 lands instantly |
| P1.8 | Lock delay 30 frames, 15 move reset cap, top out rules | `src/engine/lock.ts` | P1.5, P1.7 | 2.5 | Piece locks at reset 16; top out fires on blocked spawn |
| P1.9 | T spin detection: 3 corner rule, last action rotation, mini via front corners, kick 5 upgrades mini | `src/engine/tspin.ts` | P1.6 | 2 | Fixture boards for TSS, TSD, TST, mini all classify correctly |
| P1.10 | Scoring: clear table, back to back × 1.5, combo, perfect clear, drop points, level up every 10 lines | `src/engine/scoring.ts` | P1.9 | 2.5 | Table driven tests cover every row of the spec scoring table |
| P1.11 | `step(state, input)`: hold, spawn, move, rotate, drop, lock, clear, emit events | `src/engine/game.ts` | P1.3 to P1.10, P1.13 | 4 | Scripted 20 piece game produces expected board and score |
| P1.12 | Replay record and playback; golden replay runner in CI | `src/engine/replay.ts`, `tests/replays/` | P1.11 | 2.5 | 3 golden replays reproduce exact final score and board hash |
| P1.13 | DAS/ARR/DCD in frames from held key bitmask; `ms → frames` at 60 Hz | `src/engine/handling.ts` | P1.1 | 2 | Holding left moves at DAS 10 frames then every 2 frames with defaults |

**Core types (P1.1)**

```ts
export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type Rotation = 0 | 1 | 2 | 3;

export const enum Input {
  Left = 1 << 0, Right = 1 << 1, SoftDrop = 1 << 2, HardDrop = 1 << 3,
  RotateCW = 1 << 4, RotateCCW = 1 << 5, Rotate180 = 1 << 6, Hold = 1 << 7,
}

export interface ActivePiece {
  type: PieceType; x: number; y: number; rot: Rotation;
  lastAction: 'move' | 'rotate' | 'drop' | 'spawn';
  lastKick: number; lockFrames: number; resets: number;
}

export interface GameState {
  frame: number;
  board: Uint8Array;            // width * (visibleHeight + bufferHeight), 0 = empty
  width: number;
  active: ActivePiece | null;
  hold: PieceType | null; holdUsed: boolean;
  queue: PieceType[];
  rng: { seed: number; state: number; bag: PieceType[] };
  gravityAcc: number;
  handling: { dir: -1 | 0 | 1; dasFrames: number; arrFrames: number; prevHeld: number };
  score: number; level: number; lines: number;
  combo: number; backToBack: boolean;
  over: boolean;
}

export type GameEvent =
  | { t: 'spawn'; piece: PieceType }
  | { t: 'move' } | { t: 'rotate'; kick: number }
  | { t: 'lock'; cells: number[] }
  | { t: 'clear'; rows: number[]; kind: ClearKind; b2b: boolean; combo: number; points: number }
  | { t: 'hold'; piece: PieceType }
  | { t: 'levelUp'; level: number }
  | { t: 'topOut' };

export type ClearKind = 'single' | 'double' | 'triple' | 'quad'
  | 'tspinMini' | 'tspin' | 'tspinSingle' | 'tspinDouble' | 'tspinTriple' | 'perfectClear';

export interface StepResult { state: GameState; events: GameEvent[] }
export type Step = (s: GameState, held: number, cfg: Config) => StepResult;

export interface Replay {
  version: 1; seed: number; mode: string; config: Config;
  inputs: Array<[frame: number, held: number]>;   // only frames where held changed
  final: { score: number; boardHash: string };
}
```

**Implementation notes**

- `step` mutates a working copy and returns it; avoid per tick object allocation by reusing the events array (cleared each tick)
- Store `inputs` only when the held bitmask changes; a 2 minute game is typically under 5 KB
- Board hash for replays: FNV 1a over the `Uint8Array`

## Phase 2: Playable Marathon (22 h)

Phase 2 puts the engine on screen: one mode, keyboard only, smooth at 60 fps on a low end Chromebook.

| ID | Task | Files | Depends on | Est (h) | Done when |
| --- | --- | --- | --- | --- | --- |
| P2.1 | Fixed timestep loop: `requestAnimationFrame`, accumulator, max 5 catch up ticks, pause on `visibilitychange` | `src/main.ts`, `src/loop.ts` | P1.11 | 2 | Sim runs at 60 Hz on 30, 60, and 144 Hz displays |
| P2.2 | Keyboard: `KeyboardEvent.code` to held bitmask, `preventDefault` on game keys, release all on blur | `src/input/keyboard.ts` | P1.13 | 2 | Space and arrows never scroll; alt tab doesn't leave a key stuck |
| P2.3 | Canvas renderer: DPR scaling, cell size formula from spec, board, ghost, active piece, grid | `src/render/canvas.ts`, `layout.ts` | P2.1 | 4 | Crisp on 1x and 2x screens; resizes without blur |
| P2.4 | HUD: hold box, 5 piece queue, score, level, lines, timer, PPS | `src/render/hud.ts` | P2.3 | 3 | All values match engine state every frame |
| P2.5 | Effects driven by events: lock brighten, line clear flash and collapse, clear callouts, danger tint above row 17 | `src/render/effects.ts` | P2.3 | 2.5 | Effects never block input; off when reduced motion is on |
| P2.6 | Mode interface + Marathon (150 lines or endless) | `src/modes/mode.ts`, `marathon.ts` | P1.11 | 2 | Marathon ends at 150 lines with a win state |
| P2.7 | Screens: title, pause overlay, results (score, PB delta, restart) | `src/ui/screens/*.ts`, `src/ui/router.ts` | P2.6 | 3 | Full loop: title → game → pause → results → retry, keyboard only |
| P2.8 | Storage wrapper: versioned keys (`lb:v1:pb:marathon:w10`), safe JSON parse | `src/storage/local.ts` | P2.7 | 1 | PB survives reload; corrupt value resets instead of crashing |
| P2.9 | Performance pass: zero allocations in tick and draw, cached piece paths, debug overlay (`?debug`) with frame time p95 | `src/render/*`, `src/debug.ts` | P2.3 to P2.5 | 2.5 | p95 frame < 16.7 ms on target Chromebook over a 5 minute game |

**Mode interface (P2.6)**

```ts
export interface Mode {
  id: 'marathon' | 'sprint' | 'ultra' | 'daily' | 'zen' | 'puzzle' | 'versus';
  config(base: Config, options: Options): Config;   // overrides, e.g. Daily forces width 10
  seed(): number;
  onEvent(e: GameEvent, s: GameState): void;
  result(s: GameState): ModeResult | null;          // non null ends the game
  pbKey(cfg: Config): string;                        // includes width
}
```

**Playtest at G2:** 3 people, including at least one regular block stacker, each play 3 games and rate feel 1 to 5. Any rating under 4 gets a handling or lock delay fix before Phase 3.

## Phase 3: v1 feature set (46 h)

Phase 3 turns the playable core into the full v1: all five launch modes, the Options menu with adjustable board width, every input method, replays, the finesse coach, and offline play.

| ID | Task | Files | Depends on | Est (h) | Done when |
| --- | --- | --- | --- | --- | --- |
| P3.1 | Sprint (40 lines, time), Ultra (2 min, score), Zen (no top out, bottom rows vanish) | `src/modes/sprint.ts`, `ultra.ts`, `zen.ts` | P2.6 | 3 | Each mode ends and ranks per spec table |
| P3.2 | Daily: seed from local date `YYYYMMDD`, width forced to 10, emoji share card copied to clipboard | `src/modes/daily.ts`, `src/ui/share.ts` | P2.6 | 2.5 | Two browsers on the same date get the same first 50 pieces |
| P3.3 | Options menu shell: 8 tabs, arrow key and gamepad navigation, instant save, opens from title and pause | `src/ui/options/index.ts`, `src/storage/options.ts` | P2.7 | 4 | Every control reachable by keyboard only; values persist on reload |
| P3.4 | Gameplay tab: board width slider 6 to 16 with presets (6, 8, 10, 12, 16), live board outline preview, queue length, hold and 180 toggles | `src/ui/options/gameplay.ts` | P3.3 | 3 | Preview redraws as slider moves; change applies to next game only |
| P3.5 | Width end to end: layout collapses side panels under 14 px cells, warning under 10 px, PB keys per width, Custom tag on results | `src/render/layout.ts`, `src/modes/*`, `src/ui/screens/results.ts` | P3.4, P1.4 | 3 | Width 6 and 16 playable on a 360 px phone and a 1366 px laptop |
| P3.6 | Handling tab (DAS, ARR, DCD, soft drop, hard drop guard) and Controls tab (press to remap, conflict warning, reset) | `src/ui/options/handling.ts`, `controls.ts` | P3.3 | 4 | Remapped keys work in game; duplicate binding is blocked |
| P3.7 | Gamepad: Standard mapping poll each tick, merge into held bitmask, menu navigation | `src/input/gamepad.ts` | P2.2 | 2.5 | Xbox and generic USB pad both play a full game |
| P3.8 | Touch: drag to move, flick to hard drop, tap halves to rotate, swipe up to hold, on screen pause | `src/input/touch.ts` | P2.2 | 3.5 | Sprint completable on a phone without mis hard drops in 3 test runs |
| P3.9 | Audio: Web Audio buffers, master/music/SFX buses, unlock on first gesture, combo pitch steps | `src/audio/*.ts`, `public/audio/` | P2.5 | 3 | No sound before first input; combo raises pitch each step |
| P3.10 | Visuals and Accessibility tabs: palettes, piece letters, ghost opacity, UI scale, reduced motion, ARIA live clear announcements | `src/ui/options/visuals.ts`, `a11y.ts`, `src/render/themes/` | P3.3 | 3.5 | Screen reader announces menus and clears; reduced motion disables shake and particles |
| P3.11 | Replays in IndexedDB, replay viewer with speed control, ghost race overlay of best run | `src/storage/replays.ts`, `src/ui/screens/replay.ts`, `src/render/ghost.ts` | P1.12, P2.3 | 4 | Saved Sprint replays play back to the same time and board hash |
| P3.12 | Finesse coach: BFS of minimum inputs per placement for the active width at game start; fault flag and results % | `src/engine/finesse.ts`, `src/render/hud.ts` | P1.11, P3.5 | 4 | BFS under 5 ms at width 16; known fault fixtures detected |
| P3.13 | Assists: undo via ring buffer of 20 state snapshots, gravity scale, landing score preview; assisted runs tagged and kept off PBs | `src/engine/undo.ts`, `src/ui/options/assists.ts` | P1.11, P3.3 | 2.5 | Undo restores exact prior state; assisted games never write PBs |
| P3.14 | Data tab: export and import save as JSON, clear replays, reset all with confirm | `src/ui/options/data.ts` | P3.3, P3.11 | 1 | Export from one browser imports into another with PBs intact |
| P3.15 | PWA: vite-plugin-pwa, manifest, icons, precache | `vite.config.ts`, `public/manifest.webmanifest` | P0.6 | 1.5 | Game loads with network off after first visit |
| P3.16 | Budget pass: Lighthouse CI, bundle trim, audio compression | `.github/workflows/ci.yml`, `lighthouserc.json` | P3.1 to P3.15 | 1 | Lighthouse ≥ 95 and bundle < 150 KB enforced in CI |

**Options storage shape (P3.3)**

```ts
export interface Options {
  version: 1;
  gameplay: { boardWidth: number; queueLength: number; hold: boolean; allow180: boolean };
  handling: { dasMs: number; arrMs: number; dcdMs: number; softDropFactor: number; hardDropGuardMs: number };
  controls: { keyboard: Record<Action, string[]>; gamepad: Record<Action, number[]> };
  visuals: { theme: string; palette: 'default' | 'deutan' | 'contrast'; ghostOpacity: number; grid: boolean; uiScale: number; shake: boolean };
  audio: { master: number; music: number; sfx: number; muteOnBlur: boolean };
  a11y: { reducedMotion: 'system' | 'on' | 'off'; pieceLetters: boolean; announce: boolean };
  assists: { undo: boolean; gravityScale: number; landingPreview: boolean };
}
```

Options map onto `Config` through one function, `toConfig(options, mode)`, so the engine never reads Options directly.

## Phase 4: v1.1 puzzles, modifiers, stats (24 h)

Phase 4 adds depth without touching core rules: puzzles and modifiers are config plus win conditions, and stats read data the engine already emits.

| ID | Task | Files | Depends on | Est (h) | Done when |
| --- | --- | --- | --- | --- | --- |
| P4.1 | Puzzle JSON format and schema: width, starting board rows, fixed piece sequence, goal, piece budget, star thresholds | `src/modes/puzzle/schema.ts`, `puzzles/README.md` | G3 | 2.5 | Malformed level fails CI with the file name and field |
| P4.2 | Puzzle mode: goal checks (clear N lines, perform a named clear, empty the board), budget, 1 to 3 stars | `src/modes/puzzle/index.ts` | P4.1 | 4 | Each goal type has a passing and a failing fixture |
| P4.3 | Author 20 starter puzzles in 4 tiers; each ships a solution replay that CI plays | `puzzles/*.json`, `tests/puzzles.test.ts` | P4.2 | 6 | All 20 solutions reach 3 stars in CI |
| P4.4 | Puzzle select screen with tiers, stars earned, lock until previous tier has 10 stars | `src/ui/screens/puzzles.ts` | P4.2 | 2 | Progress persists and exports with save data |
| P4.5 | Modifiers: invisible stack, big pieces (2x2 cells per mino), rising garbage, mirror, no hold; selectable in Gameplay tab | `src/engine/modifiers/*.ts`, `src/ui/options/gameplay.ts` | G3 | 5 | Each modifier combines with Marathon and Sprint; runs tagged on results |
| P4.6 | Stats dashboard: per game summary in IndexedDB, PPS, finesse %, clear type mix, 30 game trend lines | `src/storage/history.ts`, `src/ui/screens/stats.ts` | G3 | 4.5 | Dashboard renders 500 stored games in under 100 ms |

**Puzzle level example (P4.1)**

```json
{
  "id": "t2-03",
  "title": "First T spin double",
  "width": 10,
  "board": [
    "XXXX......",
    "XXX...XXXX",
    "XXXX.XXXXX"
  ],
  "sequence": ["T"],
  "goal": { "type": "clear", "kind": "tspinDouble" },
  "budget": 1,
  "stars": [1, 1, 1]
}
```

## Phase 5: v1.2 CPU bot, Versus, local 2 player (32 h)

Phase 5 adds head to head play; the bot reuses the engine headlessly, so its search and the player's game obey identical rules.

| ID | Task | Files | Depends on | Est (h) | Done when |
| --- | --- | --- | --- | --- | --- |
| P5.1 | Garbage: attack table, cancel incoming before sending, queued rows with one hole per batch, width aware | `src/engine/garbage.ts` | G3 | 3 | Attack values match spec table; cancel math tested |
| P5.2 | Bot evaluator: weighted features (aggregate height, holes, bumpiness, well depth, lines, T slot) | `src/bot/evaluate.ts` | P5.1 | 5 | Default weights clear 1,000 lines headless without topping out |
| P5.3 | Placement search: BFS over reachable placements (includes spins), consider hold, 1 piece lookahead | `src/bot/search.ts` | P5.2, P3.12 | 5 | Finds TSD in the P4.3 fixtures; under 4 ms per decision |
| P5.4 | Input driver: converts chosen placement to held bitmask frames at target PPS; 5 levels vary PPS, lookahead, and noise | `src/bot/driver.ts`, `levels.ts` | P5.3 | 3 | Level 1 runs about 0.5 PPS, level 5 about 2.5 PPS |
| P5.5 | Versus layout: two boards, incoming garbage meter, win/lose overlay, scales on narrow screens | `src/render/versus.ts` | P5.1 | 4 | Two width 10 boards fit at 1366 px without scroll |
| P5.6 | Versus CPU mode: pick level, best of 3, results | `src/modes/versus.ts` | P5.4, P5.5 | 2.5 | Full match playable start to finish |
| P5.7 | Local 2 player: split keyboard defaults (WASD side and arrows side), per player gamepad assign, shared seed | `src/modes/local2p.ts`, `src/input/players.ts` | P5.5 | 4 | Two players with two pads play a match with no input crossover |
| P5.8 | Bot tuning harness: headless matches in Node, win rate matrix across levels | `scripts/bot-league.ts` | P5.4 | 3.5 | Each level beats the one below in ≥ 70% of 100 matches |
| P5.9 | v1.2 polish, README update, release tag | Various | P5.1 to P5.8 | 2 | `v1.2.0` tagged and live |

## Test strategy and release checklist

The engine carries most of the test weight because it is pure; browser tests stay thin and only prove the pieces connect.

| Layer | Tool | What it covers | Runs |
| --- | --- | --- | --- |
| Unit | Vitest | Board, rotation kicks, T spin fixtures, scoring table, handling frames, garbage, config validation | Every PR |
| Property | Vitest + fast-check | Random input streams never produce overlapping cells, negative score, or out of bounds pieces, at widths 6 to 16 | Every PR |
| Golden replays | Vitest | Recorded games must reproduce exact score and board hash | Every PR |
| Puzzles | Vitest | Each level's solution replay earns 3 stars | Every PR (from Phase 4) |
| Smoke | Playwright (Chromium) | Load, start Marathon, hard drop 10 pieces, open Options, change width, start new game | Every PR (from Phase 2) |
| Performance | Lighthouse CI + size-limit | Score ≥ 95, bundle < 150 KB | Every PR (from Phase 3) |
| Bot league | Node script | Level win rates | Before each v1.2 release |
| Manual | Checklist below | Feel, devices, accessibility | Each gate |

**Release checklist (each gate)**

- [ ] All PR checks green on `main`
- [ ] Manual play on: low end Chromebook, Windows laptop, iPhone Safari, Android Chrome
- [ ] Gamepad test: one Xbox style and one generic pad
- [ ] Widths 6, 10, 16 each played to game over
- [ ] Screen reader pass on menus (ChromeVox and VoiceOver)
- [ ] Offline load works after first visit
- [ ] No use of the protected name, terms, colors, or music anywhere in UI, metadata, or repo
- [ ] Version bumped, tag pushed, README changelog updated
