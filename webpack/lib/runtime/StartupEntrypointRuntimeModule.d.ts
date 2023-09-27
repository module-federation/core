export = StartupEntrypointRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../MainTemplate")} MainTemplate */
declare class StartupEntrypointRuntimeModule extends RuntimeModule {
  /**
   * @param {boolean} asyncChunkLoading use async chunk loading
   */
  constructor(asyncChunkLoading: boolean);
  asyncChunkLoading: boolean;
}
declare namespace StartupEntrypointRuntimeModule {
  export { Compilation, MainTemplate };
}
import RuntimeModule = require('../RuntimeModule');
type Compilation = import('../Compilation');
type MainTemplate = import('../MainTemplate');
