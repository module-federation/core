export = MergeDuplicateChunksPlugin;
/** @typedef {import("../Compiler")} Compiler */
declare class MergeDuplicateChunksPlugin {
  /**
   * @param {Compiler} compiler the compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace MergeDuplicateChunksPlugin {
  export { Compiler };
}
type Compiler = import('../Compiler');
