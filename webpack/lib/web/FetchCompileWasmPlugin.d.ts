export = FetchCompileWasmPlugin;
/**
 * @typedef {Object} FetchCompileWasmPluginOptions
 * @property {boolean} [mangleImports] mangle imports
 */
declare class FetchCompileWasmPlugin {
  /**
   * @param {FetchCompileWasmPluginOptions} [options] options
   */
  constructor(options?: FetchCompileWasmPluginOptions);
  options: FetchCompileWasmPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace FetchCompileWasmPlugin {
  export { Chunk, Compiler, FetchCompileWasmPluginOptions };
}
type FetchCompileWasmPluginOptions = {
  /**
   * mangle imports
   */
  mangleImports?: boolean;
};
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
