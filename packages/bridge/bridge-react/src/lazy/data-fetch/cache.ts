import { LRUCache } from 'lru-cache';
import { getDataFetchCache } from '../utils';

import type {
  CacheConfig,
  CacheItem,
  DataFetch,
  DataFetchParams,
} from '../types';

export const CacheSize = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
} as const;

export const CacheTime = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

export type CacheStatus = 'hit' | 'stale' | 'miss';

export interface CacheStatsInfo {
  status: CacheStatus;
  key: string | symbol;
  params: DataFetchParams;
  result: any;
}

interface CacheOptions {
  tag?: string | string[];
  maxAge?: number;
  revalidate?: number;
  getKey?: <Args extends any[]>(...args: Args) => string;
  customKey?: <Args extends any[]>(options: {
    params: Args;
    fn: (...args: Args) => any;
    generatedKey: string;
  }) => string | symbol;
  onCache?: (info: CacheStatsInfo) => boolean;
}

function getTagKeyMap() {
  const dataFetchCache = getDataFetchCache();
  if (!dataFetchCache || !dataFetchCache.tagKeyMap) {
    const tagKeyMap = new Map<string, Set<string>>();
    globalThis.__MF_DATA_FETCH_CACHE__ ||= {};
    globalThis.__MF_DATA_FETCH_CACHE__.tagKeyMap = tagKeyMap;
    return tagKeyMap;
  }
  return dataFetchCache.tagKeyMap;
}

function addTagKeyRelation(tag: string, key: string) {
  const tagKeyMap = getTagKeyMap();
  let keys = tagKeyMap.get(tag);
  if (!keys) {
    keys = new Set();
    tagKeyMap.set(tag, keys);
  }
  keys.add(key);
}

function getCacheConfig() {
  const dataFetchCache = getDataFetchCache();
  if (!dataFetchCache || !dataFetchCache.cacheConfig) {
    const cacheConfig: CacheConfig = {
      maxSize: CacheSize.GB,
    };
    globalThis.__MF_DATA_FETCH_CACHE__ ||= {};
    globalThis.__MF_DATA_FETCH_CACHE__.cacheConfig = cacheConfig;
    return cacheConfig;
  }
  return dataFetchCache.cacheConfig;
}

export function configureCache(config: CacheConfig): void {
  const cacheConfig = getCacheConfig();
  Object.assign(cacheConfig, config);
}

function getLRUCache() {
  const dataFetchCache = getDataFetchCache();
  const cacheConfig = getCacheConfig();

  if (!dataFetchCache || !dataFetchCache.cacheStore) {
    const cacheStore = new LRUCache<string, Map<string, CacheItem<any>>>({
      maxSize: cacheConfig.maxSize ?? CacheSize.GB,
      sizeCalculation: (value: Map<string, CacheItem<any>>): number => {
        if (!value.size) {
          return 1;
        }

        let size = 0;
        for (const [k, item] of value.entries()) {
          size += k.length * 2;
          size += estimateObjectSize(item.data);
          size += 8;
        }
        return size;
      },
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });
    globalThis.__MF_DATA_FETCH_CACHE__ ||= {};
    globalThis.__MF_DATA_FETCH_CACHE__.cacheStore = cacheStore;
    return cacheStore;
  }

  return dataFetchCache.cacheStore;
}

function estimateObjectSize(data: unknown): number {
  const type = typeof data;

  if (type === 'number') return 8;
  if (type === 'boolean') return 4;
  if (type === 'string') return Math.max((data as string).length * 2, 1);
  if (data === null || data === undefined) return 1;

  if (ArrayBuffer.isView(data)) {
    return Math.max(data.byteLength, 1);
  }

  if (Array.isArray(data)) {
    return Math.max(
      data.reduce((acc, item) => acc + estimateObjectSize(item), 0),
      1,
    );
  }

  if (data instanceof Map || data instanceof Set) {
    return 1024;
  }

  if (data instanceof Date) {
    return 8;
  }

  if (type === 'object') {
    return Math.max(
      Object.entries(data).reduce(
        (acc, [key, value]) => acc + key.length * 2 + estimateObjectSize(value),
        0,
      ),
      1,
    );
  }

  return 1;
}

export function generateKey(dataFetchOptions: DataFetchParams): string {
  return JSON.stringify(dataFetchOptions, (_, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value)
        .sort()
        .reduce((result: Record<string, unknown>, key) => {
          result[key] = value[key];
          return result;
        }, {});
    }
    return value;
  });
}

export function cache<T>(
  fn: DataFetch<T>,
  options?: CacheOptions,
): DataFetch<T> {
  const {
    tag = 'default',
    maxAge = CacheTime.MINUTE * 5,
    revalidate = 0,
    onCache,
    getKey,
  } = options || {};

  const tags = Array.isArray(tag) ? tag : [tag];

  return async (dataFetchOptions) => {
    // if downgrade, skip cache
    if (dataFetchOptions.isDowngrade || !dataFetchOptions._id) {
      return fn(dataFetchOptions);
    }
    const store = getLRUCache();

    const now = Date.now();
    const storeKey = dataFetchOptions._id;
    const cacheKey = getKey
      ? getKey(dataFetchOptions)
      : generateKey(dataFetchOptions);

    tags.forEach((t) => addTagKeyRelation(t, cacheKey));

    let cacheStore = store.get(cacheKey);
    if (!cacheStore) {
      cacheStore = new Map();
    }

    const cached = cacheStore.get(storeKey);
    if (cached) {
      const age = now - cached.timestamp;

      if (age < maxAge) {
        if (onCache) {
          const useCache = onCache({
            status: 'hit',
            key: cacheKey,
            params: dataFetchOptions,
            result: cached.data,
          });
          if (!useCache) {
            return fn(dataFetchOptions);
          }
        }
        return cached.data;
      }

      if (revalidate > 0 && age < maxAge + revalidate) {
        if (onCache) {
          onCache({
            status: 'stale',
            key: cacheKey,
            params: dataFetchOptions,
            result: cached.data,
          });
        }

        if (!cached.isRevalidating) {
          cached.isRevalidating = true;
          Promise.resolve().then(async () => {
            try {
              const newData = await fn(dataFetchOptions);
              cacheStore!.set(storeKey, {
                data: newData,
                timestamp: Date.now(),
                isRevalidating: false,
              });

              store.set(cacheKey, cacheStore!);
            } catch (error) {
              cached.isRevalidating = false;
              console.error('Background revalidation failed:', error);
            }
          });
        }
        return cached.data;
      }
    }

    const data = await fn(dataFetchOptions);
    cacheStore.set(storeKey, {
      data,
      timestamp: now,
      isRevalidating: false,
    });
    store.set(cacheKey, cacheStore);

    if (onCache) {
      onCache({
        status: 'miss',
        key: cacheKey,
        params: dataFetchOptions,
        result: data,
      });
    }

    return data;
  };
}

export function revalidateTag(tag: string): void {
  const tagKeyMap = getTagKeyMap();
  const keys = tagKeyMap.get(tag);
  const lruCache = getLRUCache();
  if (keys) {
    keys.forEach((key) => {
      lruCache?.delete(key);
    });
  }
}

export function clearStore(): void {
  const lruCache = getLRUCache();
  const tagKeyMap = getTagKeyMap();

  lruCache?.clear();
  delete globalThis.__MF_DATA_FETCH_CACHE__?.cacheStore;
  tagKeyMap.clear();
}
