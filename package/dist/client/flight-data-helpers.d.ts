import type { CacheNodeSeedData, FlightData, FlightDataPath, FlightRouterState, FlightSegmentPath, Segment } from '../server/app-render/types';
import type { HeadData } from '../shared/lib/app-router-context.shared-runtime';
export type NormalizedFlightData = {
    /**
     * The full `FlightSegmentPath` inclusive of the final `Segment`
     */
    segmentPath: FlightSegmentPath;
    /**
     * The `FlightSegmentPath` exclusive of the final `Segment`
     */
    pathToSegment: FlightSegmentPath;
    segment: Segment;
    tree: FlightRouterState;
    seedData: CacheNodeSeedData | null;
    head: HeadData;
    isHeadPartial: boolean;
    isRootRender: boolean;
};
export declare function getFlightDataPartsFromPath(flightDataPath: FlightDataPath): NormalizedFlightData;
export declare function getNextFlightSegmentPath(flightSegmentPath: FlightSegmentPath): FlightSegmentPath;
export declare function normalizeFlightData(flightData: FlightData): NormalizedFlightData[] | string;
