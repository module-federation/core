export = CommonJsChunkLoadingPlugin;
declare class CommonJsChunkLoadingPlugin {
  /**
   * @param {CommonJsChunkLoadingPluginOptions=} options options
   */
  constructor(options?: CommonJsChunkLoadingPluginOptions | undefined);
  _asyncChunkLoading: boolean;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace CommonJsChunkLoadingPlugin {
  export {
    Chunk,
    Compiler,
    RuntimeRequirements,
    CommonJsChunkLoadingPluginOptions,
  };
}
type Chunk = import('../Chunk');
type Compiler = import('../Compiler');
type RuntimeRequirements = import('../Module').RuntimeRequirements;
type CommonJsChunkLoadingPluginOptions = {
  /**
   * enable async chunk loading
   */
  asyncChunkLoading?: boolean | undefined;
};
