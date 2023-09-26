export = LimitChunkCountPlugin;
declare class LimitChunkCountPlugin {
  /**
   * @param {LimitChunkCountPluginOptions=} options options object
   */
  constructor(options?: LimitChunkCountPluginOptions | undefined);
  options: import('../../declarations/plugins/optimize/LimitChunkCountPlugin').LimitChunkCountPluginOptions;
  /**
   * @param {Compiler} compiler the webpack compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace LimitChunkCountPlugin {
  export { LimitChunkCountPluginOptions, Chunk, Compiler, ChunkCombination };
}
type Compiler = import('../Compiler');
type LimitChunkCountPluginOptions =
  import('../../declarations/plugins/optimize/LimitChunkCountPlugin').LimitChunkCountPluginOptions;
type Chunk = import('../Chunk');
type ChunkCombination = {
  /**
   * this is set to true when combination was removed
   */
  deleted: boolean;
  sizeDiff: number;
  integratedSize: number;
  a: Chunk;
  b: Chunk;
  aIdx: number;
  bIdx: number;
  aSize: number;
  bSize: number;
};
