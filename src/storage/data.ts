export function exportSave(store: Storage = localStorage): string {
  const dump: Record<string, string> = {};
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (!key || !key.startsWith('lb:v1:')) continue;
    const value = store.getItem(key);
    if (value !== null) dump[key] = value;
  }
  return JSON.stringify({ version: 1, data: dump }, null, 2);
}

export function importSave(json: string, store: Storage = localStorage): void {
  const parsed = JSON.parse(json) as { data?: Record<string, string> };
  if (!parsed.data || typeof parsed.data !== 'object') {
    throw new Error('Invalid save file');
  }
  for (const [key, value] of Object.entries(parsed.data)) {
    if (key.startsWith('lb:v1:') && typeof value === 'string') {
      store.setItem(key, value);
    }
  }
}

export function resetSave(store: Storage = localStorage): void {
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key?.startsWith('lb:v1:')) keys.push(key);
  }
  for (const key of keys) store.removeItem(key);
}
