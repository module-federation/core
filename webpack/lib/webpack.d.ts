export = webpack;
/**
 * Returns the compiler object.
 * @overload
 * @param {WebpackOptions} options options object
 * @param {Callback<Stats>} callback callback
 * @returns {Compiler | null} the compiler object
 */
declare function webpack(options: WebpackOptions, callback: Callback<Stats>): Compiler | null;
/**
 * Returns the compiler object.
 * @overload
 * @param {WebpackOptions} options options object
 * @returns {Compiler} the compiler object
 */
declare function webpack(options: WebpackOptions): Compiler;
/**
 * Returns the multi compiler object.
 * @overload
 * @param {MultiWebpackOptions} options options objects
 * @param {Callback<MultiStats>} callback callback
 * @returns {MultiCompiler | null} the multi compiler object
 */
declare function webpack(options: MultiCompiler.MultiWebpackOptions, callback: Callback<MultiStats>): MultiCompiler | null;
/**
 * Returns the multi compiler object.
 * @overload
 * @param {MultiWebpackOptions} options options objects
 * @returns {MultiCompiler} the multi compiler object
 */
declare function webpack(options: MultiCompiler.MultiWebpackOptions): MultiCompiler;
declare namespace webpack {
    export { WebpackPluginFunction, WebpackPluginInstanceApplyFunction, Callback, ErrorCallback };
}
import type { WebpackOptions } from "../declarations/WebpackOptions";
import type Stats from "./stats/Stats";
import Compiler = require("./Compiler");
import type MultiCompiler from "./MultiCompiler";
import type MultiStats from "./stats/MultiStats";
type WebpackPluginFunction = (this: Compiler, compiler: Compiler) => void;
type WebpackPluginInstanceApplyFunction = (compiler: Compiler) => void;
/**
 * Defines the callback callback.
 */
type Callback<T, R = void> = (err: Error | null, result?: T | undefined) => R;
type ErrorCallback = Callback<void>;
