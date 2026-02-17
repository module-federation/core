export = NamedChunkIdsPlugin;
declare class NamedChunkIdsPlugin {
  /**
   * @param {NamedChunkIdsPluginOptions=} options options
   */
  constructor(options?: NamedChunkIdsPluginOptions | undefined);
  delimiter: string;
  context: string;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace NamedChunkIdsPlugin {
  export { Compiler, NamedChunkIdsPluginOptions };
}
type Compiler = import('../Compiler');
type NamedChunkIdsPluginOptions = {
  /**
   * context
   */
  context?: string | undefined;
  /**
   * delimiter
   */
  delimiter?: string | undefined;
};
