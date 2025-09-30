import type { FlightRouterState } from '../../../server/app-render/types';
import type { NormalizedFlightData } from '../../flight-data-helpers';
import type { Mutable, ReadonlyReducerState } from './router-reducer-types';
/**
 * This is a stop-gap until per-segment caching is implemented. It leverages the `aliased` flag that is added
 * to prefetch entries when it's determined that the loading state from that entry should be used for this navigation.
 * This function takes the aliased entry and only applies the loading state to the updated cache node.
 * We should remove this once per-segment fetching is implemented as ideally the prefetch cache will contain a
 * more granular segment map and so the router will be able to simply re-use the loading segment for the new navigation.
 */
export declare function handleAliasedPrefetchEntry(navigatedAt: number, state: ReadonlyReducerState, flightData: string | NormalizedFlightData[], url: URL, mutable: Mutable): false | import("./router-reducer-types").ReducerState;
/**
 * Add search params to the page segments in the flight router state
 * Page segments that are associated with search params have a page segment key
 * followed by a query string. This function will add those params to the page segment.
 * This is useful if we return an aliased prefetch entry (ie, won't have search params)
 * but the canonical router URL has search params.
 */
export declare function addSearchParamsToPageSegments(flightRouterState: FlightRouterState, searchParams: Record<string, string | string[] | undefined>): FlightRouterState;
