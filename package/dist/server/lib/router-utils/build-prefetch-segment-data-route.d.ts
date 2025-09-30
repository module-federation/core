export declare const SEGMENT_PATH_KEY = "nextSegmentPath";
export type PrefetchSegmentDataRoute = {
    source: string;
    destination: string;
};
export declare function buildPrefetchSegmentDataRoute(page: string, segmentPath: string): PrefetchSegmentDataRoute;
