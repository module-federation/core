import type { WorkStore } from '../app-render/work-async-storage.external';
import type { IncrementalCache } from '../lib/incremental-cache';
import type { RenderOpts } from '../app-render/types';
import type { FetchMetric } from '../base-http';
import type { RequestLifecycleOpts } from '../base-server';
import type { FallbackRouteParams } from '../request/fallback-params';
import type { AppSegmentConfig } from '../../build/segment-config/app/app-segment-config';
import type { CacheLife } from '../use-cache/cache-life';
export type WorkStoreContext = {
    /**
     * The page that is being rendered. This relates to the path to the page file.
     */
    page: string;
    /**
     * The route parameters that are currently unknown.
     */
    fallbackRouteParams: FallbackRouteParams | null;
    requestEndedState?: {
        ended?: boolean;
    };
    isPrefetchRequest?: boolean;
    renderOpts: {
        cacheLifeProfiles?: {
            [profile: string]: CacheLife;
        };
        incrementalCache?: IncrementalCache;
        isOnDemandRevalidate?: boolean;
        fetchCache?: AppSegmentConfig['fetchCache'];
        isPossibleServerAction?: boolean;
        pendingWaitUntil?: Promise<any>;
        experimental: Pick<RenderOpts['experimental'], 'isRoutePPREnabled' | 'dynamicIO' | 'authInterrupts'>;
        /**
         * Fetch metrics attached in patch-fetch.ts
         **/
        fetchMetrics?: FetchMetric[];
    } & Pick<RenderOpts, 'assetPrefix' | 'supportsDynamicResponse' | 'shouldWaitOnAllReady' | 'isRevalidate' | 'nextExport' | 'isDraftMode' | 'isDebugDynamicAccesses' | 'dev'> & RequestLifecycleOpts & Partial<Pick<RenderOpts, 'reactLoadableManifest'>>;
    /**
     * The build ID of the current build.
     */
    buildId: string;
    previouslyRevalidatedTags: string[];
};
export declare function createWorkStore({ page, fallbackRouteParams, renderOpts, requestEndedState, isPrefetchRequest, buildId, previouslyRevalidatedTags, }: WorkStoreContext): WorkStore;
