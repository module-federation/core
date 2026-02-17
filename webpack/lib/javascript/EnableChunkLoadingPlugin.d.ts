export = EnableChunkLoadingPlugin;
declare class EnableChunkLoadingPlugin {
  /**
   * @param {Compiler} compiler the compiler instance
   * @param {ChunkLoadingType} type type of library
   * @returns {void}
   */
  static setEnabled(compiler: Compiler, type: ChunkLoadingType): void;
  /**
   * @param {Compiler} compiler the compiler instance
   * @param {ChunkLoadingType} type type of library
   * @returns {void}
   */
  static checkEnabled(compiler: Compiler, type: ChunkLoadingType): void;
  /**
   * @param {ChunkLoadingType} type library type that should be available
   */
  constructor(type: ChunkLoadingType);
  type: string;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace EnableChunkLoadingPlugin {
  export { ChunkLoadingType, Compiler };
}
type Compiler = import('../Compiler');
type ChunkLoadingType =
  import('../../declarations/WebpackOptions').ChunkLoadingType;
