import type { CacheNodeSeedData, FlightRouterState, FlightSegmentPath } from '../../../server/app-render/types';
import type { CacheNode, HeadData, ReadyCacheNode } from '../../../shared/lib/app-router-context.shared-runtime';
import type { FetchServerResponseResult } from './fetch-server-response';
type SPANavigationTask = {
    route: FlightRouterState;
    node: CacheNode | null;
    dynamicRequestTree: FlightRouterState | null;
    children: Map<string, SPANavigationTask> | null;
};
type MPANavigationTask = {
    route: null;
    node: null;
    dynamicRequestTree: null;
    children: null;
};
export type Task = SPANavigationTask | MPANavigationTask;
export declare function startPPRNavigation(navigatedAt: number, oldCacheNode: CacheNode, oldRouterState: FlightRouterState, newRouterState: FlightRouterState, prefetchData: CacheNodeSeedData | null, prefetchHead: HeadData | null, isPrefetchHeadPartial: boolean, isSamePageNavigation: boolean, scrollableSegmentsResult: Array<FlightSegmentPath>): Task | null;
export declare function listenForDynamicRequest(task: SPANavigationTask, responsePromise: Promise<FetchServerResponseResult>): void;
export declare function abortTask(task: SPANavigationTask, error: any): void;
export declare function updateCacheNodeOnPopstateRestoration(oldCacheNode: CacheNode, routerState: FlightRouterState): ReadyCacheNode;
export {};
