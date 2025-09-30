/**
 * If set to `incremental`, only those leaf pages that export
 * `experimental_ppr = true` will have partial prerendering enabled. If any
 * page exports this value as `false` or does not export it at all will not
 * have partial prerendering enabled. If set to a boolean, it the options for
 * `experimental_ppr` will be ignored.
 */
export type ExperimentalPPRConfig = boolean | 'incremental';
/**
 * Returns true if partial prerendering is enabled for the application. It does
 * not tell you if a given route has PPR enabled, as that requires analysis of
 * the route's configuration.
 *
 * @see {@link checkIsRoutePPREnabled} - for checking if a specific route has PPR enabled.
 */
export declare function checkIsAppPPREnabled(config: ExperimentalPPRConfig | undefined): boolean;
/**
 * Returns true if partial prerendering is supported for the current page with
 * the provided app configuration. If the application doesn't have partial
 * prerendering enabled, this function will always return false. If you want to
 * check if the application has partial prerendering enabled
 *
 * @see {@link checkIsAppPPREnabled} for checking if the application has PPR enabled.
 */
export declare function checkIsRoutePPREnabled(config: ExperimentalPPRConfig | undefined, appConfig: {
    experimental_ppr?: boolean;
}): boolean;
