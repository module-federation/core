export = ImportScriptsChunkLoadingPlugin;
declare class ImportScriptsChunkLoadingPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ImportScriptsChunkLoadingPlugin {
  export { Chunk, Compiler, RuntimeRequirements };
}
type Chunk = import('../Chunk');
type Compiler = import('../Compiler');
type RuntimeRequirements = import('../Module').RuntimeRequirements;
