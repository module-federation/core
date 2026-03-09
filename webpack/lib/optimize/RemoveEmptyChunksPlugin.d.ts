export = RemoveEmptyChunksPlugin;
declare class RemoveEmptyChunksPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace RemoveEmptyChunksPlugin {
  export { Chunk, Compiler };
}
type Chunk = import('../Chunk');
type Compiler = import('../Compiler');
