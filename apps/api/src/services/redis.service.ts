// In-memory store — no Redis required for development
const store = new Map<string, { value: string; expiresAt?: number }>();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt && entry.expiresAt < now) store.delete(key);
  }
}

setInterval(cleanup, 60_000);

export const redisService = {
  async get<T>(key: string): Promise<T | null> {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) { store.delete(key); return null; }
    return JSON.parse(entry.value) as T;
  },
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    store.set(key, {
      value: JSON.stringify(value),
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  },
  async del(key: string): Promise<void> { store.delete(key); },
  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of store.keys()) { if (regex.test(key)) store.delete(key); }
  },
  async exists(key: string): Promise<boolean> {
    const entry = store.get(key);
    if (!entry) return false;
    if (entry.expiresAt && entry.expiresAt < Date.now()) { store.delete(key); return false; }
    return true;
  },
};

export const redis = redisService;
