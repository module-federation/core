export = PublicPathRuntimeModule;
/** @typedef {import("../../declarations/WebpackOptions").PublicPath} PublicPath */
/** @typedef {import("../Compilation")} Compilation */
declare class PublicPathRuntimeModule extends RuntimeModule {
  /**
   * @param {PublicPath} publicPath public path
   */
  constructor(publicPath: PublicPath);
  publicPath: import('../../declarations/WebpackOptions').PublicPath;
}
declare namespace PublicPathRuntimeModule {
  export { PublicPath, Compilation };
}
import RuntimeModule = require('../RuntimeModule');
type PublicPath = import('../../declarations/WebpackOptions').PublicPath;
type Compilation = import('../Compilation');
