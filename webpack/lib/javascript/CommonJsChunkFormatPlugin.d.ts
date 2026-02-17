export = CommonJsChunkFormatPlugin;
declare class CommonJsChunkFormatPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace CommonJsChunkFormatPlugin {
  export { Chunk, Compiler };
}
type Chunk = import('../Chunk');
type Compiler = import('../Compiler');
