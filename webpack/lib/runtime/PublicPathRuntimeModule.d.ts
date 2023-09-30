export = PublicPathRuntimeModule;
/** @typedef {import("../../declarations/WebpackOptions").OutputNormalized} OutputOptions */
/** @typedef {import("../Compilation")} Compilation */
declare class PublicPathRuntimeModule extends RuntimeModule {
  /**
   * @param {OutputOptions["publicPath"]} publicPath public path
   */
  constructor(publicPath: OutputOptions['publicPath']);
  publicPath: import('../../declarations/WebpackOptions').PublicPath;
}
declare namespace PublicPathRuntimeModule {
  export { OutputOptions, Compilation };
}
import RuntimeModule = require('../RuntimeModule');
type OutputOptions =
  import('../../declarations/WebpackOptions').OutputNormalized;
type Compilation = import('../Compilation');
