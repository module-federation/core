/**
 * Defines the webpack options interception type used by this module.
 */
export type WebpackOptionsInterception = {
    devtool?: WebpackOptionsNormalized["devtool"] | undefined;
};
export type NormalizedBuildDependencyItem = {
    /**
     * request to resolve
     */
    dependency: string;
    /**
     * when true the dependency may be missing
     */
    optional: boolean;
};
/**
 * Apply webpack options interception.
 * @param {WebpackOptionsNormalized} options options to be intercepted
 * @returns {{ options: WebpackOptionsNormalized, interception?: WebpackOptionsInterception }} options and interception
 */
export function applyWebpackOptionsInterception(options: WebpackOptionsNormalized): {
    options: WebpackOptionsNormalized;
    interception?: WebpackOptionsInterception;
};
/**
 * Gets normalized webpack options.
 * @param {WebpackOptions} config input config
 * @returns {WebpackOptionsNormalized} normalized options
 */
export function getNormalizedWebpackOptions(config: WebpackOptions): WebpackOptionsNormalized;
import type { WebpackOptionsNormalized } from "../../declarations/WebpackOptions";
import type { WebpackOptions } from "../../declarations/WebpackOptions";
