import type { NextConfigComplete } from '../../../server/config-shared';
import type { MiddlewareMatcher } from '../../analysis/get-page-static-info';
type BloomFilter = ReturnType<import('../../../shared/lib/bloom-filter').BloomFilter['export']>;
export interface DefineEnvPluginOptions {
    isTurbopack: boolean;
    clientRouterFilters?: {
        staticFilter: BloomFilter;
        dynamicFilter: BloomFilter;
    };
    config: NextConfigComplete;
    dev: boolean;
    distDir: string;
    fetchCacheKeyPrefix: string | undefined;
    hasRewrites: boolean;
    isClient: boolean;
    isEdgeServer: boolean;
    isNodeOrEdgeCompilation: boolean;
    isNodeServer: boolean;
    middlewareMatchers: MiddlewareMatcher[] | undefined;
    omitNonDeterministic?: boolean;
}
interface SerializedDefineEnv {
    [key: string]: string;
}
export declare function getDefineEnv({ isTurbopack, clientRouterFilters, config, dev, distDir, fetchCacheKeyPrefix, hasRewrites, isClient, isEdgeServer, isNodeOrEdgeCompilation, isNodeServer, middlewareMatchers, omitNonDeterministic, }: DefineEnvPluginOptions): SerializedDefineEnv;
export declare function getDefineEnvPlugin(options: DefineEnvPluginOptions): import("webpack").DefinePlugin;
export {};
