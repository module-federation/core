import type { Segment as FlightRouterStateSegment } from './types';
import type { ManifestNode } from '../../build/webpack/plugins/flight-manifest-plugin';
import type { HeadData, LoadingModuleData } from '../../shared/lib/app-router-context.shared-runtime';
import type { FallbackRouteParams } from '../request/fallback-params';
export type RootTreePrefetch = {
    buildId: string;
    tree: TreePrefetch;
    head: HeadData;
    isHeadPartial: boolean;
    staleTime: number;
};
export type TreePrefetch = {
    segment: FlightRouterStateSegment;
    slots: null | {
        [parallelRouteKey: string]: TreePrefetch;
    };
    isRootLayout: boolean;
};
export type SegmentPrefetch = {
    buildId: string;
    rsc: React.ReactNode | null;
    loading: LoadingModuleData | Promise<LoadingModuleData>;
    isPartial: boolean;
};
export declare function collectSegmentData(shouldAssumePartialData: boolean, fullPageDataBuffer: Buffer, staleTime: number, clientModules: ManifestNode, serverConsumerManifest: any, fallbackRouteParams: FallbackRouteParams | null): Promise<Map<string, Buffer>>;
