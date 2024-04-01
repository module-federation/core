export = WebpackOptionsApply;
/** @typedef {import("../declarations/WebpackOptions").WebpackOptionsNormalized} WebpackOptions */
/** @typedef {import("./Compiler")} Compiler */
declare class WebpackOptionsApply extends OptionsApply {
  /**
   * @param {WebpackOptions} options options object
   * @param {Compiler} compiler compiler object
   * @returns {WebpackOptions} options object
   */
  process(options: WebpackOptions, compiler: Compiler): WebpackOptions;
}
declare namespace WebpackOptionsApply {
  export { WebpackOptions, Compiler };
}
import OptionsApply = require('./OptionsApply');
type WebpackOptions =
  import('../declarations/WebpackOptions').WebpackOptionsNormalized;
type Compiler = import('./Compiler');
