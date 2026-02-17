export = HashedModuleIdsPlugin;
declare class HashedModuleIdsPlugin {
  /**
   * @param {HashedModuleIdsPluginOptions=} options options object
   */
  constructor(options?: HashedModuleIdsPluginOptions | undefined);
  /** @type {HashedModuleIdsPluginOptions} */
  options: HashedModuleIdsPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace HashedModuleIdsPlugin {
  export { HashedModuleIdsPluginOptions, Compiler };
}
type HashedModuleIdsPluginOptions =
  import('../../declarations/plugins/HashedModuleIdsPlugin').HashedModuleIdsPluginOptions;
type Compiler = import('../Compiler');
