export = webpack;
/**
 * @overload
 * @param {WebpackOptions} options options object
 * @param {Callback<Stats>} callback callback
 * @returns {Compiler | null} the compiler object
 */
declare function webpack(
  options: WebpackOptions,
  callback: Callback<Stats>,
): Compiler | null;
/**
 * @overload
 * @param {WebpackOptions} options options object
 * @returns {Compiler} the compiler object
 */
declare function webpack(options: WebpackOptions): Compiler;
/**
 * @overload
 * @param {MultiWebpackOptions} options options objects
 * @param {Callback<MultiStats>} callback callback
 * @returns {MultiCompiler | null} the multi compiler object
 */
declare function webpack(
  options: MultiWebpackOptions,
  callback: Callback<MultiStats>,
): MultiCompiler | null;
/**
 * @overload
 * @param {MultiWebpackOptions} options options objects
 * @returns {MultiCompiler} the multi compiler object
 */
declare function webpack(options: MultiWebpackOptions): MultiCompiler;
declare namespace webpack {
  export {
    WebpackOptions,
    WebpackPluginFunction,
    WebpackOptionsNormalizedWithDefaults,
    WatchOptions,
    MultiCompilerOptions,
    MultiWebpackOptions,
    MultiStats,
    Stats,
    Callback,
    ErrorCallback,
  };
}
import Compiler = require('./Compiler');
import MultiCompiler = require('./MultiCompiler');
type WebpackOptions = import('../declarations/WebpackOptions').WebpackOptions;
type WebpackPluginFunction =
  import('../declarations/WebpackOptions').WebpackPluginFunction;
type WebpackOptionsNormalizedWithDefaults =
  import('./config/defaults').WebpackOptionsNormalizedWithDefaults;
type WatchOptions = import('./Compiler').WatchOptions;
type MultiCompilerOptions = import('./MultiCompiler').MultiCompilerOptions;
type MultiWebpackOptions = import('./MultiCompiler').MultiWebpackOptions;
type MultiStats = import('./MultiStats');
type Stats = import('./Stats');
type Callback<T, R = void> = (err: Error | null, result?: T | undefined) => R;
type ErrorCallback = Callback<void>;
