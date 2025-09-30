import type { Segment as FlightRouterStateSegment } from '../../../server/app-render/types';
type Opaque<K, T> = T & {
    __brand: K;
};
export type EncodedSegment = Opaque<'EncodedSegment', string>;
export declare function encodeSegment(segment: FlightRouterStateSegment): EncodedSegment;
export declare const ROOT_SEGMENT_KEY = "";
export declare function encodeChildSegmentKey(parentSegmentKey: string, parallelRouteKey: string, segment: EncodedSegment): string;
export declare function convertSegmentPathToStaticExportFilename(segmentPath: string): string;
export {};
