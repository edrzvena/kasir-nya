const _cache = new Map<string, { data: unknown; at: number }>();
const CACHE_TTL = 600_000;
const STORAGE_KEY = 'kasirnya_cache_v1';

(function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, { data: unknown; at: number }>;
    const now = Date.now();
    Object.entries(parsed).forEach(([k, v]) => {
      if (v && typeof v.at === 'number' && now - v.at <= CACHE_TTL) {
        _cache.set(k, v);
      }
    });
  } catch {}
})();

function persist() {
  try {
    const obj: Record<string, { data: unknown; at: number }> = {};
    _cache.forEach((v, k) => { obj[k] = v; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {}
}

export function fromCache<T>(key: string): T | null {
  const e = _cache.get(key);
  if (!e) return null;
  if (Date.now() - e.at > CACHE_TTL) {
    _cache.delete(key);
    persist();
    return null;
  }
  return e.data as T;
}

export function toCache(key: string, data: unknown) {
  _cache.set(key, { data, at: Date.now() });
  persist();
}

export function bustCache(...keys: string[]) {
  keys.forEach(k => _cache.delete(k));
  persist();
}
