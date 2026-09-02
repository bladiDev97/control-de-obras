export class InMemoryCache {
  private cache = new Map<string, { data: any; expiry: number }>();

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  public set(key: string, data: any, ttlMs = 30000): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  public clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const globalCache = new InMemoryCache();
