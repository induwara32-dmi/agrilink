export interface AnalyticsCacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
}

interface CacheEntry { value: unknown; expiresAt: number }
export class MemoryAnalyticsCacheService implements AnalyticsCacheService {
  private readonly entries = new Map<string, CacheEntry>();
  public constructor(private readonly maxEntries = 1_000) {}
  public async get<T>(key: string): Promise<T | null> { const entry = this.entries.get(key); if (!entry) return null; if (entry.expiresAt <= Date.now()) { this.entries.delete(key); return null; } return entry.value as T; }
  public async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> { if (this.entries.size >= this.maxEntries) { const oldest = this.entries.keys().next().value; if (oldest) this.entries.delete(oldest); } this.entries.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1_000 }); }
  public async delete(key: string): Promise<void> { this.entries.delete(key); }
}
