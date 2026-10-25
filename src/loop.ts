export interface Loop {
  start(): void;
  stop(): void;
}

export function createLoop(
  tickHz: number,
  onTick: (now: number) => void,
  onFrame: (now: number, dt: number) => void,
  maxCatchUp = 5,
): Loop {
  const step = 1000 / tickHz;
  let acc = 0;
  let last = 0;
  let raf = 0;
  let running = false;
  let hidden = false;

  function frame(now: number): void {
    if (!running) return;
    if (hidden) {
      last = now;
      raf = requestAnimationFrame(frame);
      return;
    }
    const dt = last ? now - last : 0;
    last = now;
    acc += dt;
    let ticks = 0;
    while (acc >= step && ticks < maxCatchUp) {
      onTick(now);
      acc -= step;
      ticks += 1;
    }
    if (ticks === maxCatchUp) acc = 0;
    onFrame(now, dt);
    raf = requestAnimationFrame(frame);
  }

  function onVis(): void {
    hidden = document.hidden;
    if (!hidden) last = performance.now();
  }

  return {
    start() {
      if (running) return;
      running = true;
      last = 0;
      acc = 0;
      document.addEventListener('visibilitychange', onVis);
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
    },
  };
}
