import type { LoadComponentsReturnType } from '../load-components';
import type { ServerRuntime, SizeLimit } from '../../types';
import type { ExperimentalConfig, NextConfigComplete } from '../../server/config-shared';
import type { ClientReferenceManifest } from '../../build/webpack/plugins/flight-manifest-plugin';
import type { NextFontManifest } from '../../build/webpack/plugins/next-font-manifest-plugin';
import type { ParsedUrlQuery } from 'querystring';
import type { AppPageModule } from '../route-modules/app-page/module';
import type { HeadData, LoadingModuleData } from '../../shared/lib/app-router-context.shared-runtime';
import type { DeepReadonly } from '../../shared/lib/deep-readonly';
import type { __ApiPreviewProps } from '../api-utils';
import s from 'next/dist/compiled/superstruct';
import type { RequestLifecycleOpts } from '../base-server';
import type { InstrumentationOnRequestError } from '../instrumentation/types';
import type { NextRequestHint } from '../web/adapter';
import type { BaseNextRequest } from '../base-http';
import type { IncomingMessage } from 'http';
import type { RenderResumeDataCache } from '../resume-data-cache/resume-data-cache';
export type DynamicParamTypes = 'catchall' | 'catchall-intercepted' | 'optional-catchall' | 'dynamic' | 'dynamic-intercepted';
declare const dynamicParamTypesSchema: s.Struct<"d" | "c" | "ci" | "oc" | "di", {
    d: "d";
    c: "c";
    ci: "ci";
    oc: "oc";
    di: "di";
}>;
export type DynamicParamTypesShort = s.Infer<typeof dynamicParamTypesSchema>;
declare const segmentSchema: s.Struct<string | [string, string, "d" | "c" | "ci" | "oc" | "di"], null>;
export type Segment = s.Infer<typeof segmentSchema>;
export declare const flightRouterStateSchema: s.Describe<any>;
/**
 * Router state
 */
export type FlightRouterState = [
    segment: Segment,
    parallelRoutes: {
        [parallelRouterKey: string]: FlightRouterState;
    },
    url?: string | null,
    /**
     * "refresh" and "refetch", despite being similarly named, have different
     * semantics:
     * - "refetch" is used during a request to inform the server where rendering
     *   should start from.
     *
     * - "refresh" is used by the client to mark that a segment should re-fetch the
     *   data from the server for the current segment. It uses the "url" property
     *   above to determine where to fetch from.
     *
     * - "inside-shared-layout" is used during a prefetch request to inform the
     *   server that even if the segment matches, it should be treated as if it's
     *   within the "new" part of a navigation — inside the shared layout. If
     *   the segment doesn't match, then it has no effect, since it would be
     *   treated as new regardless. If it does match, though, the server does not
     *   need to render it, because the client already has it.
     *
     *   A bit confusing, but that's because it has only one extremely narrow use
     *   case — during a non-PPR prefetch, the server uses it to find the first
     *   loading boundary beneath a shared layout.
     *
     *   TODO: We should rethink the protocol for dynamic requests. It might not
     *   make sense for the client to send a FlightRouterState, since this type is
     *   overloaded with concerns.
     */
    refresh?: 'refetch' | 'refresh' | 'inside-shared-layout' | null,
    isRootLayout?: boolean
];
/**
 * Individual Flight response path
 */
export type FlightSegmentPath = any[] | [
    segment: Segment,
    parallelRouterKey: string,
    segment: Segment,
    parallelRouterKey: string,
    segment: Segment,
    parallelRouterKey: string
];
/**
 * Represents a tree of segments and the Flight data (i.e. React nodes) that
 * correspond to each one. The tree is isomorphic to the FlightRouterState;
 * however in the future we want to be able to fetch arbitrary partial segments
 * without having to fetch all its children. So this response format will
 * likely change.
 */
export type CacheNodeSeedData = [
    segment: Segment,
    node: React.ReactNode | null,
    parallelRoutes: {
        [parallelRouterKey: string]: CacheNodeSeedData | null;
    },
    loading: LoadingModuleData | Promise<LoadingModuleData>,
    isPartial: boolean
];
export type FlightDataSegment = [
    Segment,
    FlightRouterState,
    CacheNodeSeedData | null,
    HeadData,
    boolean
];
export type FlightDataPath = any[] | [
    ...FlightSegmentPath[],
    ...FlightDataSegment
];
/**
 * The Flight response data
 */
export type FlightData = Array<FlightDataPath> | string;
export type ActionResult = Promise<any>;
export type ServerOnInstrumentationRequestError = (error: unknown, request: NextRequestHint | BaseNextRequest | IncomingMessage, errorContext: Parameters<InstrumentationOnRequestError>[2]) => void | Promise<void>;
export interface RenderOptsPartial {
    previewProps: __ApiPreviewProps | undefined;
    err?: Error | null;
    dev?: boolean;
    basePath: string;
    trailingSlash: boolean;
    clientReferenceManifest?: DeepReadonly<ClientReferenceManifest>;
    supportsDynamicResponse: boolean;
    runtime?: ServerRuntime;
    serverComponents?: boolean;
    enableTainting?: boolean;
    assetPrefix?: string;
    crossOrigin?: '' | 'anonymous' | 'use-credentials' | undefined;
    nextFontManifest?: DeepReadonly<NextFontManifest>;
    botType?: 'dom' | 'html' | undefined;
    serveStreamingMetadata?: boolean;
    incrementalCache?: import('../lib/incremental-cache').IncrementalCache;
    cacheLifeProfiles?: {
        [profile: string]: import('../use-cache/cache-life').CacheLife;
    };
    setIsrStatus?: (key: string, value: boolean | null) => void;
    isRevalidate?: boolean;
    nextExport?: boolean;
    nextConfigOutput?: 'standalone' | 'export';
    onInstrumentationRequestError?: ServerOnInstrumentationRequestError;
    isDraftMode?: boolean;
    deploymentId?: string;
    onUpdateCookies?: (cookies: string[]) => void;
    loadConfig?: (phase: string, dir: string, customConfig?: object | null, rawConfig?: boolean, silent?: boolean) => Promise<NextConfigComplete>;
    serverActions?: {
        bodySizeLimit?: SizeLimit;
        allowedOrigins?: string[];
    };
    params?: ParsedUrlQuery;
    isPrefetch?: boolean;
    htmlLimitedBots: string | undefined;
    experimental: {
        /**
         * When true, it indicates that the current page supports partial
         * prerendering.
         */
        isRoutePPREnabled?: boolean;
        expireTime: number | undefined;
        staleTimes: ExperimentalConfig['staleTimes'] | undefined;
        clientTraceMetadata: string[] | undefined;
        dynamicIO: boolean;
        clientSegmentCache: boolean | 'client-only';
        dynamicOnHover: boolean;
        inlineCss: boolean;
        authInterrupts: boolean;
    };
    postponed?: string;
    /**
     * Should wait for react stream allReady to resolve all suspense boundaries,
     * in order to perform a full page render.
     */
    shouldWaitOnAllReady?: boolean;
    /**
     * The resume data cache that was generated for this partially prerendered
     * page during dev warmup.
     */
    devRenderResumeDataCache?: RenderResumeDataCache;
    /**
     * When true, the page will be rendered using the static rendering to detect
     * any dynamic API's that would have stopped the page from being fully
     * statically generated.
     */
    isDebugDynamicAccesses?: boolean;
    /**
     * The maximum length of the headers that are emitted by React and added to
     * the response.
     */
    reactMaxHeadersLength: number | undefined;
    isStaticGeneration?: boolean;
}
export type RenderOpts = LoadComponentsReturnType<AppPageModule> & RenderOptsPartial & RequestLifecycleOpts;
export type PreloadCallbacks = (() => void)[];
export type InitialRSCPayload = {
    /** buildId */
    b: string;
    /** assetPrefix */
    p: string;
    /** initialCanonicalUrlParts */
    c: string[];
    /** couldBeIntercepted */
    i: boolean;
    /** initialFlightData */
    f: FlightDataPath[];
    /** missingSlots */
    m: Set<string> | undefined;
    /** GlobalError */
    G: [React.ComponentType<any>, React.ReactNode | undefined];
    /** postponed */
    s: boolean;
    /** prerendered */
    S: boolean;
};
export type NavigationFlightResponse = {
    /** buildId */
    b: string;
    /** flightData */
    f: FlightData;
    /** prerendered */
    S: boolean;
};
export type ActionFlightResponse = {
    /** actionResult */
    a: ActionResult;
    /** buildId */
    b: string;
    /** flightData */
    f: FlightData;
};
export type RSCPayload = InitialRSCPayload | NavigationFlightResponse | ActionFlightResponse;
export {};
