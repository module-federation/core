/**
 * Parse the app segment config.
 * @param data - The data to parse.
 * @param route - The route of the app.
 * @returns The parsed app segment config.
 */
export declare function parseAppSegmentConfig(data: unknown, route: string): AppSegmentConfig;
/**
 * The configuration for a page.
 */
export type AppSegmentConfig = {
    /**
     * The revalidation period for the page in seconds, or false to disable ISR.
     */
    revalidate?: number | false;
    /**
     * Whether the page supports dynamic parameters.
     */
    dynamicParams?: boolean;
    /**
     * The dynamic behavior of the page.
     */
    dynamic?: 'auto' | 'error' | 'force-static' | 'force-dynamic';
    /**
     * The caching behavior of the page.
     */
    fetchCache?: 'auto' | 'default-cache' | 'default-no-store' | 'force-cache' | 'force-no-store' | 'only-cache' | 'only-no-store';
    /**
     * The preferred region for the page.
     */
    preferredRegion?: string | string[];
    /**
     * Whether the page supports partial prerendering. When true, the page will be
     * served using partial prerendering. This setting will only take affect if
     * it's enabled via the `experimental.ppr = "incremental"` option.
     */
    experimental_ppr?: boolean;
    /**
     * The runtime to use for the page.
     */
    runtime?: 'edge' | 'nodejs';
    /**
     * The maximum duration for the page in seconds.
     */
    maxDuration?: number;
};
