export = LoaderPlugin;
/** @typedef {import("../Compilation").DepConstructor} DepConstructor */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */
/**
 * @callback LoadModuleCallback
 * @param {(Error | null)=} err error object
 * @param {string | Buffer=} source source code
 * @param {object=} map source map
 * @param {Module=} module loaded module if successful
 */
/**
 * @callback ImportModuleCallback
 * @param {(Error | null)=} err error object
 * @param {any=} exports exports of the evaluated module
 */
/**
 * @typedef {Object} ImportModuleOptions
 * @property {string=} layer the target layer
 * @property {string=} publicPath the target public path
 * @property {string=} baseUri target base uri
 */
declare class LoaderPlugin {
  /**
   * @param {Object} options options
   */
  constructor(options?: any);
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace LoaderPlugin {
  export {
    DepConstructor,
    Compiler,
    Module,
    LoadModuleCallback,
    ImportModuleCallback,
    ImportModuleOptions,
  };
}
type Compiler = import('../Compiler');
type DepConstructor = import('../Compilation').DepConstructor;
type Module = import('../Module');
type LoadModuleCallback = (
  err?: (Error | null) | undefined,
  source?: (string | Buffer) | undefined,
  map?: object | undefined,
  module?: Module | undefined,
) => any;
type ImportModuleCallback = (
  err?: (Error | null) | undefined,
  exports?: any | undefined,
) => any;
type ImportModuleOptions = {
  /**
   * the target layer
   */
  layer?: string | undefined;
  /**
   * the target public path
   */
  publicPath?: string | undefined;
  /**
   * target base uri
   */
  baseUri?: string | undefined;
};
