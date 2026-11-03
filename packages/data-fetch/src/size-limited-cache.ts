export interface SizeLimitedCacheOptions<K, V> {
  maxSize: number;
  sizeCalculation?: (value: V, key: K) => number;
}

export interface SizeLimitedCacheSetOptions {
  size?: number;
}

interface CacheEntry<V> {
  value: V;
  size: number;
}

/**
 * A small, size-aware least-recently-used cache.
 *
 * This intentionally implements only the operations used by federation
 * packages. Reading or checking an entry refreshes its recency.
 */
export class SizeLimitedCache<K, V> {
  readonly maxSize: number;

  private readonly entries = new Map<K, CacheEntry<V>>();
  private readonly sizeCalculation?: (value: V, key: K) => number;
  private currentSize = 0;

  constructor(options: SizeLimitedCacheOptions<K, V>) {
    if (!Number.isInteger(options.maxSize) || options.maxSize <= 0) {
      throw new TypeError('maxSize must be a positive integer');
    }

    this.maxSize = options.maxSize;
    this.sizeCalculation = options.sizeCalculation;
  }

  get size(): number {
    return this.entries.size;
  }

  get calculatedSize(): number {
    return this.currentSize;
  }

  get(key: K): V | undefined {
    const entry = this.entries.get(key);
    if (!entry) {
      return undefined;
    }

    this.refresh(key, entry);
    return entry.value;
  }

  has(key: K): boolean {
    const entry = this.entries.get(key);
    if (!entry) {
      return false;
    }

    this.refresh(key, entry);
    return true;
  }

  set(key: K, value: V, options: SizeLimitedCacheSetOptions = {}): this {
    const entrySize = options.size ?? this.sizeCalculation?.(value, key) ?? 1;

    if (!Number.isInteger(entrySize) || entrySize <= 0) {
      throw new TypeError('entry size must be a positive integer');
    }

    this.delete(key);

    if (entrySize > this.maxSize) {
      return this;
    }

    this.entries.set(key, { value, size: entrySize });
    this.currentSize += entrySize;
    this.evictUntilWithinLimit();

    return this;
  }

  delete(key: K): boolean {
    const entry = this.entries.get(key);
    if (!entry) {
      return false;
    }

    this.currentSize -= entry.size;
    return this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
    this.currentSize = 0;
  }

  private refresh(key: K, entry: CacheEntry<V>): void {
    this.entries.delete(key);
    this.entries.set(key, entry);
  }

  private evictUntilWithinLimit(): void {
    while (this.currentSize > this.maxSize) {
      const oldest = this.entries.keys().next();
      if (oldest.done) {
        this.currentSize = 0;
        return;
      }
      this.delete(oldest.value);
    }
  }
}
