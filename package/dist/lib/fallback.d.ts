/**
 * Describes the different fallback modes that a given page can have.
 */
export declare const enum FallbackMode {
    /**
     * A BLOCKING_STATIC_RENDER fallback will block the request until the page is
     * generated. No fallback page will be rendered, and users will have to wait
     * to render the page.
     */
    BLOCKING_STATIC_RENDER = "BLOCKING_STATIC_RENDER",
    /**
     * When set to PRERENDER, a fallback page will be sent to users in place of
     * forcing them to wait for the page to be generated. This allows the user to
     * see a rendered page earlier.
     */
    PRERENDER = "PRERENDER",
    /**
     * When set to NOT_FOUND, pages that are not already prerendered will result
     * in a not found response.
     */
    NOT_FOUND = "NOT_FOUND"
}
/**
 * The fallback value returned from the `getStaticPaths` function.
 */
export type GetStaticPathsFallback = boolean | 'blocking';
/**
 * Parses the fallback field from the prerender manifest.
 *
 * @param fallbackField The fallback field from the prerender manifest.
 * @returns The fallback mode.
 */
export declare function parseFallbackField(fallbackField: string | boolean | null | undefined): FallbackMode | undefined;
export declare function fallbackModeToFallbackField(fallback: FallbackMode, page: string | undefined): string | false | null;
/**
 * Parses the fallback from the static paths result.
 *
 * @param result The result from the static paths function.
 * @returns The fallback mode.
 */
export declare function parseStaticPathsResult(result: GetStaticPathsFallback): FallbackMode;
