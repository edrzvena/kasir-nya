const _cache = new Map<string, { data: unknown; at: number }>();
const CACHE_TTL = 120_000; // 2 minutes

export function fromCache<T>(key: string): T | null {
  const e = _cache.get(key);
  if (!e) return null;
  if (Date.now() - e.at > CACHE_TTL) { _cache.delete(key); return null; }
  return e.data as T;
}

export function toCache(key: string, data: unknown) {
  _cache.set(key, { data, at: Date.now() });
}

export function bustCache(...keys: string[]) {
  keys.forEach(k => _cache.delete(k));
}
