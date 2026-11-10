/**
 * Performance In-Memory / Redis Cache Layer
 * Provides fast retrieval with TTL, automatic cleanup, and pattern-based invalidation.
 * Seamlessly integrates into existing controllers without external infrastructure dependency.
 */

class MemoryCache {
  constructor() {
    this.store = new Map();
    // Run garbage collection of expired keys every 60 seconds
    this.gcInterval = setInterval(() => this.cleanup(), 60000);
    if (this.gcInterval.unref) this.gcInterval.unref();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlSeconds = 60) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  del(key) {
    this.store.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix or pattern (e.g., 'vault:tags:userId')
   */
  invalidatePattern(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  clear() {
    this.store.clear();
  }
}

export const cache = new MemoryCache();

