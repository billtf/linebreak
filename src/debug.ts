const samples: number[] = [];

export function recordFrame(ms: number): void {
  samples.push(ms);
  if (samples.length > 300) samples.shift();
}

export function frameP95(): number {
  if (samples.length === 0) return 0;
  const sorted = samples.slice().sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
  return sorted[idx] ?? 0;
}

export function isDebug(): boolean {
  return new URLSearchParams(location.search).has('debug');
}

export function formatDebug(p95: number, fps: number): string {
  return `p95 ${p95.toFixed(1)}ms  ${fps.toFixed(0)} fps`;
}
