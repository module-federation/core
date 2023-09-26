export = RemoveParentModulesPlugin;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGroup")} ChunkGroup */
/** @typedef {import("../Compiler")} Compiler */
declare class RemoveParentModulesPlugin {
  /**
   * @param {Compiler} compiler the compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace RemoveParentModulesPlugin {
  export { Chunk, ChunkGroup, Compiler };
}
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
type ChunkGroup = import('../ChunkGroup');
