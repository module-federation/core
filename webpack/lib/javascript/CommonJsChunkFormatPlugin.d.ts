export = CommonJsChunkFormatPlugin;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Entrypoint")} Entrypoint */
declare class CommonJsChunkFormatPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace CommonJsChunkFormatPlugin {
  export { Chunk, Compiler, Entrypoint };
}
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
type Entrypoint = import('../Entrypoint');
