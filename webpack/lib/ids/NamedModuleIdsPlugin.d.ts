export = NamedModuleIdsPlugin;
declare class NamedModuleIdsPlugin {
  /**
   * @param {NamedModuleIdsPluginOptions=} options options
   */
  constructor(options?: NamedModuleIdsPluginOptions | undefined);
  options: NamedModuleIdsPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace NamedModuleIdsPlugin {
  export { Compiler, NamedModuleIdsPluginOptions };
}
type Compiler = import('../Compiler');
type NamedModuleIdsPluginOptions = {
  /**
   * context
   */
  context?: string | undefined;
};
