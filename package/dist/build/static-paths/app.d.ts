import type { AppPageModule } from '../../server/route-modules/app-page/module';
import type { AppSegment } from '../segment-config/app/app-segments';
import type { StaticPathsResult } from './types';
import type { IncrementalCache } from '../../server/lib/incremental-cache';
import type { NextConfigComplete } from '../../server/config-shared';
/**
 * Builds the static paths for an app using `generateStaticParams`.
 *
 * @param params - The parameters for the build.
 * @returns The static paths.
 */
export declare function buildAppStaticPaths({ dir, page, distDir, dynamicIO, authInterrupts, segments, isrFlushToDisk, cacheHandler, cacheLifeProfiles, requestHeaders, cacheHandlers, maxMemoryCacheSize, fetchCacheKeyPrefix, nextConfigOutput, ComponentMod, isRoutePPREnabled, buildId, rootParamKeys, }: {
    dir: string;
    page: string;
    dynamicIO: boolean;
    authInterrupts: boolean;
    segments: AppSegment[];
    distDir: string;
    isrFlushToDisk?: boolean;
    fetchCacheKeyPrefix?: string;
    cacheHandler?: string;
    cacheHandlers?: NextConfigComplete['experimental']['cacheHandlers'];
    cacheLifeProfiles?: {
        [profile: string]: import('../../server/use-cache/cache-life').CacheLife;
    };
    maxMemoryCacheSize?: number;
    requestHeaders: IncrementalCache['requestHeaders'];
    nextConfigOutput: 'standalone' | 'export' | undefined;
    ComponentMod: AppPageModule;
    isRoutePPREnabled: boolean;
    buildId: string;
    rootParamKeys: readonly string[];
}): Promise<Partial<StaticPathsResult>>;
