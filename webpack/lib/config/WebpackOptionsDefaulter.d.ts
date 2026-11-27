export = WebpackOptionsDefaulter;
/**
 * @import {
 * 	WebpackOptions,
 * 	WebpackOptionsNormalized
 * } from "../../declarations/WebpackOptions"
 */
declare class WebpackOptionsDefaulter {
    /**
     * Returns normalized webpack options.
     * @param {WebpackOptions} options webpack options
     * @returns {WebpackOptionsNormalized} normalized webpack options
     */
    process(options: WebpackOptions): WebpackOptionsNormalized;
}
import type { WebpackOptions } from "../../declarations/WebpackOptions";
import type { WebpackOptionsNormalized } from "../../declarations/WebpackOptions";
