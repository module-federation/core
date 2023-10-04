export = ModuleChunkFormatPlugin;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Entrypoint")} Entrypoint */
declare class ModuleChunkFormatPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ModuleChunkFormatPlugin {
  export { Chunk, Compiler, Entrypoint };
}
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
type Entrypoint = import('../Entrypoint');
