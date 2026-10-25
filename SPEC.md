# Linebreak Game Spec

Oct 24, 2026 · @bc

## Summary

Linebreak is a browser based falling block puzzle game that ships as a static site from a single GitHub repo, deployed to GitHub Pages with zero servers. It keeps the classic 10 by 20 stacking loop and fixes what older versions get wrong: unfair rotation, no undo for misdrops in casual play, flat progression, and no replayability beyond chasing a high score.

**Design pillars**

| Pillar | What it means in practice |
| --- | --- |
| Fair | Modern rotation with wall kicks, 7 bag randomizer, lock delay, hold, 5 piece preview. Every loss is the player's fault, never the RNG's. |
| Readable | Ghost piece, clear lock flash, colorblind safe palettes, no visual noise near the stack. |
| Deep | Combos, back to backs, spins, and garbage give skilled players a ceiling far above line clearing. |
| Replayable | Daily seeded challenge, puzzle mode, unlockable modifiers, local ghost replays. |
| Portable | Runs offline from GitHub Pages on any Chromebook, laptop, or phone. No accounts, no backend, no install. |

## Goals, non goals, success metrics

The v1 goal is a polished single player game anyone can play from a URL in under 3 seconds, with feel that competitive players respect.

**Goals**

- Clone the repo, run one command, play locally; push to `main`, live on GitHub Pages within 2 minutes
- 60 fps on a low end Chromebook (4 GB RAM, Celeron class CPU)
- Input latency under 1 frame from keydown to piece movement
- Fully playable offline after first load (PWA)
- Deterministic engine: same seed plus same inputs always yields the same game

**Non goals for v1**

- Online multiplayer, accounts, or global leaderboards (needs a backend)
- Monetization, ads, analytics that track users
- Native app store builds

**Success metrics**

| Metric | Target | How measured |
| --- | --- | --- |
| First load, cold cache | < 3 s on 4G | Lighthouse in CI |
| JS bundle size | < 150 KB gzipped | CI size check |
| Frame time p95 | < 16.7 ms | In game debug overlay |
| Lighthouse performance | ≥ 95 | CI |
| Engine test coverage | ≥ 90% lines | Vitest coverage |
| Replay determinism | 100% of recorded replays reproduce | CI replay suite |

## Core gameplay rules

The engine follows the modern guideline feel players already know, so muscle memory transfers on day one.

**Board and pieces**

- Playfield 10 wide by 20 visible rows, plus 20 hidden buffer rows above (spawn at rows 21 to 22)
- 7 one sided tetromino shapes: I, O, T, S, Z, J, L
- Randomizer: 7 bag (shuffle all 7, deal, repeat); seeded PRNG (mulberry32 or xoshiro128)
- Next queue shows 5 pieces; Hold slot usable once per piece
- Ghost piece always shown at the landing position

**Rotation**

- Super Rotation System (SRS) with standard wall kick tables (5 tests per rotation; separate table for I)
- 180 degree rotation as an optional input, with its own kick table
- Kick tables live in data, not code, so alternate systems can be swapped in later

**Gravity, lock, and top out**

| Rule | Value |
| --- | --- |
| Tick model | Fixed 60 Hz simulation, decoupled from render |
| Gravity at level 1 | 1 row per 60 frames |
| Gravity curve | (0.8 − (level − 1) × 0.007) ^ (level − 1) seconds per row; 20G from level 20 |
| Lock delay | 30 frames (0.5 s) |
| Move reset cap | 15 resets per piece, then forced lock |
| Soft drop | 20× gravity (configurable) |
| Hard drop | Instant, 2 points per row |
| Top out | Spawn overlaps blocks, or a piece locks fully above row 20 |

**Line clears and scoring**

Level advances every 10 lines. Base points multiply by current level.

| Action | Points × level |
| --- | --- |
| Single | 100 |
| Double | 300 |
| Triple | 500 |
| Quad (4 lines) | 800 |
| T spin mini, no lines | 100 |
| T spin, no lines | 400 |
| T spin single | 800 |
| T spin double | 1200 |
| T spin triple | 1600 |
| Back to back bonus (consecutive quads or T spin clears) | × 1.5 |
| Combo (consecutive piece clears) | 50 × combo count |
| Perfect clear (board empty) | 800 to 3200 by lines cleared |
| Soft drop | 1 per row |
| Hard drop | 2 per row |

T spin detection uses the 3 corner rule plus the last move was a rotation; mini vs full uses the 2 front corners test.

## What makes it better

Ten features separate Linebreak from a plain clone; the first five ship in v1, the rest in v1.1 and v1.2.

| # | Feature | What it does | Why it's better | Release |
| --- | --- | --- | --- | --- |
| 1 | Full input tuning | DAS, ARR, soft drop factor, and key remapping, saved locally | Competitive players can match their muscle memory; most web clones hardcode these | v1 |
| 2 | Finesse coach | Flags when a piece took more inputs than the optimal path and shows the faster sequence | Turns every game into practice; no other casual web version teaches efficiency | v1 |
| 3 | Daily seed | Everyone gets the same piece order each day (seed = date); share result as an emoji grid | Gives a reason to come back daily without needing a server | v1 |
| 4 | Replays and ghost race | Every game saved as seed plus input log (\~5 KB); race your own best replay as a translucent ghost | Self competition with no backend; replays double as regression tests | v1 |
| 5 | Casual assists | Optional undo last piece, slower gravity, and piece preview of the landing score; assisted runs are tagged and kept off records | Lowers the floor for kids and new players without diluting high scores | v1 |
| 6 | Puzzle mode | Hand built boards with a goal (clear in N pieces, perform a T spin double); JSON level files | Teaches advanced techniques; community can contribute levels by PR | v1.1 |
| 7 | Modifiers | Toggle rules: invisible stack, big pieces, rising garbage, mirror mode, no hold | Stacks into hundreds of variants from a small codebase | v1.1 |
| 8 | Stats dashboard | Pieces per second, finesse %, attack per minute, clear type breakdown, trend over sessions | Shows improvement over time, which drives retention | v1.1 |
| 9 | Versus CPU | Garbage battle against a bot with 5 difficulty levels | Head to head tension with no netcode | v1.2 |
| 10 | Local 2 player | Split screen on one keyboard or two gamepads | Couch play; zero infrastructure | v1.2 |

## Game modes

Seven modes share one engine; each mode is a config object plus a win/lose condition, so adding a mode is a data change, not an engine change.

| Mode | Goal | Ends when | Ranked by | Release |
| --- | --- | --- | --- | --- |
| Marathon | Survive and score | Top out, or 150 lines (optional endless) | Score | v1 |
| Sprint | Clear 40 lines | 40 lines cleared | Time (lowest) | v1 |
| Ultra | Max score in 2 minutes | Timer hits 0 | Score | v1 |
| Daily | Marathon on today's shared seed | Top out | Score; share card | v1 |
| Zen | Relax, no gravity pressure, no top out (bottom rows vanish) | Player quits | None | v1 |
| Puzzle | Solve a hand built board | Goal met or piece budget used | Stars (1 to 3) | v1.1 |
| Versus CPU | Bury the bot with garbage | One side tops out | Win/loss | v1.2 |

**Garbage rules (Versus):** single 0, double 1, triple 2, quad 4, T spin double 4, T spin triple 6, back to back +1, combo table +1 to +5. Incoming garbage cancels outgoing first, then rises with one random hole per batch.

## Controls and input

Input is polled once per simulation tick from a buffered event queue, so a keypress never gets lost between frames and replays reproduce exactly.

| Action | Keyboard default | Gamepad (Standard mapping) | Touch |
| --- | --- | --- | --- |
| Move left / right | ← / → | D pad left / right | Drag horizontally |
| Soft drop | ↓ | D pad down | Drag down slowly |
| Hard drop | Space | D pad up | Flick down |
| Rotate clockwise | ↑ or X | A | Tap right half |
| Rotate counterclockwise | Z | B | Tap left half |
| Rotate 180 | A | Y | Two finger tap |
| Hold | C or Shift | LB / RB | Swipe up |
| Pause | Esc or P | Start | Pause button |
| Restart | R (hold 0.5 s) | Select (hold) | Menu |
| Undo (assist mode only) | Ctrl+Z | Not mapped | Menu |

**Handling settings** (all saved to localStorage, all remappable)

| Setting | Default | Range |
| --- | --- | --- |
| DAS (delay before auto repeat) | 167 ms | 0 to 400 ms |
| ARR (auto repeat rate) | 33 ms | 0 (instant) to 100 ms |
| DCD (DAS cut delay after rotate) | 0 ms | 0 to 100 ms |
| Soft drop factor | 20× | 5× to instant |
| Prevent accidental hard drop | 0 ms | 0 to 200 ms |

Use `KeyboardEvent.code`, not `key`, so layouts like AZERTY map by physical position. Call `preventDefault` on game keys so Space and arrows never scroll the page.

## UX, visuals, audio, accessibility

The look is original: flat rounded blocks on a dark neutral board, with all color and art defined in swappable theme files so nothing copies any existing game's trade dress.

**Screens**

1. Title: Play, Daily, Modes, Settings, Stats
2. Mode select with personal best per mode
3. Game: hold (left), board (center), next queue (right), stats strip below (score, level, lines, PPS, timer)
4. Pause overlay: resume, restart, settings, quit
5. Results: score, PB delta, finesse %, clear type breakdown, save replay, share (daily only)
6. Options: gameplay (including board width), handling, controls, visuals, audio, accessibility, assists, data

**Visual feedback**

- Line clear: 150 ms flash and collapse; quad and T spin get a short callout label and screen shake (shake toggleable)
- Lock: 1 frame brighten on lock so the moment of commitment is clear
- Danger: board edge tints red when the stack passes row 17
- Particles capped at 200 to protect frame time

**Audio**

- Original SFX for move, rotate, lock, clear by type, combo pitch rising per step, top out
- Music: original or CC0 tracks only; tempo steps up at levels 10 and 15
- Separate master, music, and SFX volume; audio unlocks on first user gesture (browser autoplay rule)

**Accessibility**

| Need | Support |
| --- | --- |
| Color vision | 3 palettes (default, deuteranopia safe, high contrast) plus optional letter or pattern per piece |
| Motion sensitivity | Respects `prefers-reduced-motion`; disables shake, particles, flashes |
| Photosensitivity | No flashes faster than 3 per second |
| Motor | Full remap, adjustable DAS/ARR, hold to repeat instead of tap, slower gravity assist |
| Low vision | UI scale 75% to 150%, ghost piece opacity slider |
| Screen readers | Menus fully labeled and keyboard navigable; in game announces level up and clear types via an ARIA live region |

## Options menu

Options opens from the title screen and the pause overlay, grouped into 8 tabs; every change saves instantly to localStorage, and gameplay settings that alter the rules (like board width) apply on the next game, never mid game.

| Tab | Settings |
| --- | --- |
| Gameplay | Board width, start level, next queue length (1 to 6), hold on/off, 180 rotation on/off |
| Handling | DAS, ARR, DCD, soft drop factor, hard drop guard |
| Controls | Key remap, gamepad remap, touch layout, reset to defaults |
| Visuals | Theme, palette, ghost opacity, grid lines, UI scale, screen shake |
| Audio | Master, music, SFX volume; mute on blur |
| Accessibility | Reduced motion, piece letters/patterns, high contrast, announce clears |
| Assists | Undo, gravity scale, landing score preview |
| Data | Export save (JSON), import save, clear replays, reset all |

**Board width**

Players choose a board 6 to 16 columns wide in a slider with presets, and the menu shows a live outline of the board at the chosen size.

| Preset | Columns | Feel |
| --- | --- | --- |
| Narrow | 6 | Fast, tight, perfect clears come often |
| Compact | 8 | Quicker games, less planning room |
| Classic (default) | 10 | Standard balance; required for Daily and records parity |
| Wide | 12 | More room for T spin setups and combos |
| Extra wide | 16 | Relaxed, long games, harder to clear lines |

Rules that change with width:

- **Spawn column:** `floor((width − pieceWidth) / 2)`, left biased, so pieces enter centered on any width
- **Minimum 6:** leaves room for a horizontal I piece plus SRS kicks without spawn overlap
- **Height stays 20 visible rows** for v1; a height slider (16 to 24) is a v1.1 candidate
- **Garbage holes** pick a random column within the current width
- **Finesse coach:** optimal input counts are computed by a breadth first search over moves for the active width at game start (under 5 ms), instead of a hardcoded 10 column table
- **CPU bot:** placement search already iterates columns from the board, so it works on any width
- **Puzzles** declare their own width in the level file and ignore this setting
- **Daily mode** always forces 10 columns so everyone plays the same game

Records and replays:

- Personal bests are stored per mode per width (key `sprint:w10`), and the results screen shows the width next to the score
- Every replay stores `board.width` in its settings so playback rebuilds the exact board
- Non 10 widths show a "Custom" tag on results and share cards

Rendering:

- Cell size = `floor(min(availableWidth / (width + 10), availableHeight / 22))` px, where 10 columns of space are reserved for hold and next panels
- If cell size falls under 14 px (16 wide on a small phone), side panels collapse above the board; under 10 px the option shows a warning that the board may be hard to read

## Technical architecture

TypeScript plus Vite, rendered to Canvas 2D, built by GitHub Actions and served from GitHub Pages; the engine is a pure, framework free module with no DOM access, which is what makes replays, tests, and the CPU bot possible.

&#91;embedded content: runtime architecture · 1 engine, 6 modules\]

Inputs and mode config feed the engine each tick; it emits events that render, audio, and stats consume, and the same inputs logged with the seed replay the game exactly.

**Stack**

| Layer | Choice | Why |
| --- | --- | --- |
| Language | TypeScript (strict) | Engine correctness; types for config and replay formats |
| Build | Vite | Fast dev server, small static output, `base` path for Pages |
| Render | Canvas 2D | 200 cells redraw trivially at 60 fps; no WebGL needed |
| UI shell | Plain TS + CSS (or Preact if menus grow) | Keeps bundle under 150 KB |
| Audio | Web Audio API | Low latency SFX, no library |
| Storage | localStorage (settings, PBs) + IndexedDB (replays) | No backend |
| Offline | Service worker via vite-plugin-pwa | Installable, works with no network |
| Tests | Vitest (engine), Playwright (smoke) | Engine runs headless in Node |
| Lint/format | ESLint + Prettier | Consistent PRs |
| Hosting | GitHub Pages via Actions | Free, deploy on push |

**Repo structure**

```
linebreak/
├── .github/workflows/
│   ├── ci.yml            # lint, test, replay suite, size check on PR
│   └── deploy.yml        # build and publish to Pages on push to main
├── public/
│   ├── manifest.webmanifest
│   ├── icons/
│   └── audio/
├── src/
│   ├── engine/           # pure logic, zero DOM
│   │   ├── board.ts
│   │   ├── pieces.ts     # shapes + spawn positions
│   │   ├── rotation.ts   # SRS kick tables as data
│   │   ├── randomizer.ts # seeded 7 bag
│   │   ├── rules.ts      # gravity, lock delay, scoring, T spin detection
│   │   ├── garbage.ts
│   │   ├── game.ts       # step(state, inputs) -> state + events
│   │   └── replay.ts
│   ├── modes/            # marathon.ts, sprint.ts, ultra.ts, daily.ts, zen.ts
│   ├── input/            # keyboard.ts, gamepad.ts, touch.ts, das.ts
│   ├── render/           # canvas.ts, themes/, effects.ts
│   ├── audio/
│   ├── ui/               # menus, settings, results, stats
│   ├── storage/
│   ├── bot/              # v1.2 CPU opponent
│   └── main.ts
├── puzzles/              # JSON puzzle levels (v1.1)
├── tests/
│   ├── engine/
│   └── replays/          # golden replays, must reproduce exact score
├── index.html
├── vite.config.ts
├── package.json
├── LICENSE               # MIT
└── README.md
```

**Key engine contract**

- `step(state, inputs): { state, events }` runs one 1/60 s tick; no clock, no `Math.random`, no DOM
- Events (`lineClear`, `tSpin`, `lock`, `topOut`) drive render, audio, and stats; the engine never calls them directly
- Replay = `{ version, seed, mode, settings, inputs: [frame, bitmask][] }`; playback feeds the same `step` and must match the recorded final score

**Deploy**

- `vite.config.ts` sets `base: '/linebreak/'` so asset paths resolve on `username.github.io/linebreak`
- `deploy.yml` uses `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`
- Repo Settings → Pages → Source: GitHub Actions
- Optional custom domain via `public/CNAME`

## Config schema

Every tunable number lives in one typed config, so modes, modifiers, and puzzles are just overrides of this default.

```json
{
  "version": 1,
  "board": { "width": 10, "visibleHeight": 20, "bufferHeight": 20 },
  "pieces": {
    "set": ["I", "O", "T", "S", "Z", "J", "L"],
    "randomizer": "bag7",
    "previewCount": 5,
    "holdEnabled": true,
    "rotationSystem": "srs",
    "allow180": true
  },
  "timing": {
    "tickHz": 60,
    "lockDelayFrames": 30,
    "maxLockResets": 15,
    "lineClearFrames": 9,
    "spawnDelayFrames": 0,
    "gravityCurve": "guideline",
    "softDropFactor": 20
  },
  "handling": { "dasMs": 167, "arrMs": 33, "dcdMs": 0, "hardDropGuardMs": 0 },
  "scoring": {
    "single": 100, "double": 300, "triple": 500, "quad": 800,
    "tspinMini": 100, "tspin": 400, "tspinSingle": 800,
    "tspinDouble": 1200, "tspinTriple": 1600,
    "backToBackMultiplier": 1.5, "comboPerStep": 50,
    "softDropPerRow": 1, "hardDropPerRow": 2,
    "levelMultiplier": true
  },
  "progression": { "startLevel": 1, "linesPerLevel": 10, "maxLevel": 20 },
  "assists": { "undo": false, "gravityScale": 1.0, "ghost": true },
  "modifiers": [],
  "theme": "default",
  "palette": "default"
}
```

Validate configs at load with a JSON Schema (or Zod) and reject unknown keys, so a bad puzzle file fails loudly in CI instead of silently in game.

`board.width` accepts integers 6 to 16 (default 10); the Options menu writes the player's choice into this field, and Daily mode overrides it back to 10.

## Build plan

Six phases take it from empty repo to v1.2; each phase ends with a deployable build on GitHub Pages, and nothing advances until its acceptance criteria pass.

**Phase 0: Repo and pipeline**

- [ ] Vite + TS scaffold, ESLint, Prettier, Vitest
- [ ] `ci.yml` runs on every PR; `deploy.yml` publishes a placeholder page on push to `main`
- [ ] Live URL loads with correct `base` path

**Phase 1: Engine core (headless)**

- [ ] Board, pieces, seeded 7 bag, SRS kicks, gravity, lock delay, line clears, scoring, T spin detection
- [ ] Unit tests for every kick case and every scoring row; coverage ≥ 90%
- [ ] Same seed produces identical piece sequence across 10,000 pieces

**Phase 2: Playable Marathon**

- [ ] Canvas renderer, keyboard input with DAS/ARR, hold, preview, ghost
- [ ] Pause, restart, game over, high score in localStorage
- [ ] 60 fps on target Chromebook; input latency < 1 frame

**Phase 3: v1 feature set**

- [ ] Sprint, Ultra, Daily, Zen modes
- [ ] Options menu with all 8 tabs, including board width 6 to 16 with per width PBs and replays, gamepad and touch input
- [ ] Replays saved to IndexedDB; ghost race; golden replay suite in CI
- [ ] Finesse coach, casual assists, daily share card
- [ ] PWA offline; Lighthouse ≥ 95; bundle < 150 KB

**Phase 4: v1.1**

- [ ] Puzzle mode with 20 starter levels and a JSON level format documented in the README
- [ ] Modifiers, stats dashboard

**Phase 5: v1.2**

- [ ] CPU bot (heuristic placement search; 5 difficulty levels tuned by PPS and lookahead)
- [ ] Versus CPU with garbage; local 2 player split screen

**Build partner note:** Phases 0 and 1 are a good fit for an AI coding agent working from this spec, since the engine is pure logic with clear test oracles; Phase 2 feel tuning needs a human with hands on keys.

## Risks and open questions

The biggest risk is legal, not technical: the Tetris name and look are actively enforced, so the game must stay original in name, art, and audio while using the unprotectable mechanics.

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Trademark and trade dress claims from The Tetris Company | DMCA takedown of the repo or Pages site | Never use "Tetris" or "Tetrimino" in name, repo, metadata, or UI; use "tetromino" (the generic math term) or "piece"; original colors and art; no guideline piece colors as the default palette; no Korobeiniki music |
| Feel doesn't match expectations | Experienced players bounce | Expose DAS/ARR/lock settings; test with 3 to 5 regular players before v1 |
| Low end Chromebook performance | Stutter, missed inputs | Fixed timestep, no allocations in the hot loop, particle cap, perf budget in CI |
| School network blocks github.io | Kids can't reach it | Custom domain option; PWA install so it runs offline once loaded |
| Browser storage cleared | Lost PBs and replays | Export/import save as a JSON file from Settings |
| Replay format changes break old replays | Golden tests fail, user replays unplayable | Version field in every replay; keep old engine rules behind version flags |
| Gamepad API inconsistencies | Wrong button mapping on some controllers | Standard mapping only for v1; remap screen covers the rest |

**Open questions**

- [ ] Final name: is Linebreak clear of conflicts? Run a quick trademark and domain check before buying a domain
- [ ] Public or private repo? Public enables community puzzles via PR; private requires a paid plan for Pages
- [ ] Music: commission, CC0, or procedurally generated?
- [ ] Is a global leaderboard worth adding later (would need Supabase or similar plus anticheat via replay verification)?
- [ ] Primary audience for v1: kids and casual, or competitive players? Changes default DAS/ARR and whether assists are on by default
