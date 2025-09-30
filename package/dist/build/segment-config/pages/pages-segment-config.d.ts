/**
 * Parse the page segment config.
 * @param data - The data to parse.
 * @param route - The route of the page.
 * @returns The parsed page segment config.
 */
export declare function parsePagesSegmentConfig(data: unknown, route: string): PagesSegmentConfig;
export type PagesSegmentConfigConfig = {
    /**
     * Enables AMP for the page.
     */
    amp?: boolean | 'hybrid';
    /**
     * The maximum duration for the page render.
     */
    maxDuration?: number;
    /**
     * The runtime to use for the page.
     */
    runtime?: 'edge' | 'experimental-edge' | 'nodejs';
    /**
     * The preferred region for the page.
     */
    regions?: string[];
};
export type PagesSegmentConfig = {
    /**
     * The runtime to use for the page.
     */
    runtime?: 'edge' | 'experimental-edge' | 'nodejs';
    /**
     * The maximum duration for the page render.
     */
    maxDuration?: number;
    /**
     * The exported config object for the page.
     */
    config?: PagesSegmentConfigConfig;
};
