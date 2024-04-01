export = AssetModulesPlugin;
declare class AssetModulesPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace AssetModulesPlugin {
  export { Source, Chunk, Compiler, Module };
}
type Compiler = import('../Compiler');
type Source = any;
type Chunk = import('../Chunk');
type Module = import('../Module');
