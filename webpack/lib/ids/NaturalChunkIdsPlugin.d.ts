export = NaturalChunkIdsPlugin;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */
declare class NaturalChunkIdsPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace NaturalChunkIdsPlugin {
  export { Chunk, Compiler, Module };
}
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
type Module = import('../Module');
