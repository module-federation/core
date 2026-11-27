export = OptionsApply;
/**
 * @import {
 * 	WebpackOptionsNormalizedWithDefaults as WebpackOptions
 * } from "./defaults"
 */
/** @import { WebpackOptionsInterception } from "./normalization" */
/** @import Compiler from "../Compiler" */
declare class OptionsApply {
    /**
     * Returns options object.
     * @param {WebpackOptions} options options object
     * @param {Compiler} compiler compiler object
     * @param {WebpackOptionsInterception=} interception intercepted options
     * @returns {WebpackOptions} options object
     */
    process(options: WebpackOptions, compiler: Compiler, interception?: WebpackOptionsInterception | undefined): WebpackOptions;
}
import type { WebpackOptionsNormalizedWithDefaults as WebpackOptions } from "./defaults";
import type Compiler from "../Compiler";
import type { WebpackOptionsInterception } from "./normalization";
