import type { FlightRouterState } from '../../../server/app-render/types';
import type { RouteCacheKey } from './cache-key';
import { PrefetchPriority } from '../segment-cache';
export type PrefetchTask = {
    key: RouteCacheKey;
    /**
     * The FlightRouterState at the time the task was initiated. This is needed
     * when falling back to the non-PPR behavior, which only prefetches up to
     * the first loading boundary.
     */
    treeAtTimeOfPrefetch: FlightRouterState;
    /**
     * Whether to prefetch dynamic data, in addition to static data. This is
     * used by <Link prefetch={true}>.
     */
    includeDynamicData: boolean;
    /**
     * sortId is an incrementing counter
     *
     * Newer prefetches are prioritized over older ones, so that as new links
     * enter the viewport, they are not starved by older links that are no
     * longer relevant. In the future, we can add additional prioritization
     * heuristics, like removing prefetches once a link leaves the viewport.
     *
     * The sortId is assigned when the prefetch is initiated, and reassigned if
     * the same task is prefetched again (effectively bumping it to the top of
     * the queue).
     *
     * TODO: We can add additional fields here to indicate what kind of prefetch
     * it is. For example, was it initiated by a link? Or was it an imperative
     * call? If it was initiated by a link, we can remove it from the queue when
     * the link leaves the viewport, but if it was an imperative call, then we
     * should keep it in the queue until it's fulfilled.
     *
     * We can also add priority levels. For example, hovering over a link could
     * increase the priority of its prefetch.
     */
    sortId: number;
    /**
     * The priority of the task. Like sortId, this affects the task's position in
     * the queue, so it must never be updated without resifting the heap.
     */
    priority: PrefetchPriority;
    /**
     * The phase of the task. Tasks are split into multiple phases so that their
     * priority can be adjusted based on what kind of work they're doing.
     * Concretely, prefetching the route tree is higher priority than prefetching
     * segment data.
     */
    phase: PrefetchPhase;
    /**
     * Temporary state for tracking the currently running task. This is currently
     * used to track whether a task deferred some work to run background at
     * priority, but we might need it for additional state in the future.
     */
    hasBackgroundWork: boolean;
    /**
     * True if the prefetch was cancelled.
     */
    isCanceled: boolean;
    /**
     * The index of the task in the heap's backing array. Used to efficiently
     * change the priority of a task by re-sifting it, which requires knowing
     * where it is in the array. This is only used internally by the heap
     * algorithm. The naive alternative is indexOf every time a task is queued,
     * which has O(n) complexity.
     *
     * We also use this field to check whether a task is currently in the queue.
     */
    _heapIndex: number;
};
/**
 * Prefetch tasks are processed in two phases: first the route tree is fetched,
 * then the segments. We use this to priortize tasks that have not yet fetched
 * the route tree.
 */
declare const enum PrefetchPhase {
    RouteTree = 1,
    Segments = 0
}
export type PrefetchSubtaskResult<T> = {
    /**
     * A promise that resolves when the network connection is closed.
     */
    closed: Promise<void>;
    value: T;
};
/**
 * Initiates a prefetch task for the given URL. If a prefetch for the same URL
 * is already in progress, this will bump it to the top of the queue.
 *
 * This is not a user-facing function. By the time this is called, the href is
 * expected to be validated and normalized.
 *
 * @param key The RouteCacheKey to prefetch.
 * @param treeAtTimeOfPrefetch The app's current FlightRouterState
 * @param includeDynamicData Whether to prefetch dynamic data, in addition to
 * static data. This is used by <Link prefetch={true}>.
 */
export declare function schedulePrefetchTask(key: RouteCacheKey, treeAtTimeOfPrefetch: FlightRouterState, includeDynamicData: boolean, priority: PrefetchPriority): PrefetchTask;
export declare function cancelPrefetchTask(task: PrefetchTask): void;
export declare function reschedulePrefetchTask(task: PrefetchTask, treeAtTimeOfPrefetch: FlightRouterState, includeDynamicData: boolean, priority: PrefetchPriority): void;
/**
 * Notify the scheduler that we've received new data for an in-progress
 * prefetch. The corresponding task will be added back to the queue (unless the
 * task has been canceled in the meantime).
 */
export declare function pingPrefetchTask(task: PrefetchTask): void;
export {};
