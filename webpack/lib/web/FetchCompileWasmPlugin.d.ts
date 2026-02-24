export = FetchCompileWasmPlugin;
declare class FetchCompileWasmPlugin {
  /**
   * @param {FetchCompileWasmPluginOptions=} options options
   */
  constructor(options?: FetchCompileWasmPluginOptions | undefined);
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
type Chunk = import('../Chunk');
type Compiler = import('../Compiler');
type FetchCompileWasmPluginOptions = {
  /**
   * mangle imports
   */
  mangleImports?: boolean | undefined;
};
