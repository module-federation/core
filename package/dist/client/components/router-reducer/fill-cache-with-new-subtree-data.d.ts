import type { CacheNode } from '../../../shared/lib/app-router-context.shared-runtime';
import type { PrefetchCacheEntry } from './router-reducer-types';
import type { NormalizedFlightData } from '../../flight-data-helpers';
/**
 * Fill cache with rsc based on flightDataPath
 */
export declare function fillCacheWithNewSubTreeData(navigatedAt: number, newCache: CacheNode, existingCache: CacheNode, flightData: NormalizedFlightData, prefetchEntry?: PrefetchCacheEntry): void;
export declare function fillCacheWithNewSubTreeDataButOnlyLoading(navigatedAt: number, newCache: CacheNode, existingCache: CacheNode, flightData: NormalizedFlightData, prefetchEntry?: PrefetchCacheEntry): void;
