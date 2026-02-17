export = WasmFinalizeExportsPlugin;
declare class WasmFinalizeExportsPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace WasmFinalizeExportsPlugin {
  export { Compiler, Dependency, Module, BuildMeta };
}
type Compiler = import('../Compiler');
type Dependency = import('../Dependency');
type Module = import('../Module');
type BuildMeta = import('../Module').BuildMeta;
