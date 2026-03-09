export = SourceMapDevToolModuleOptionsPlugin;
declare class SourceMapDevToolModuleOptionsPlugin {
  /**
   * @param {SourceMapDevToolPluginOptions=} options options
   */
  constructor(options?: SourceMapDevToolPluginOptions | undefined);
  options: import('../declarations/plugins/SourceMapDevToolPlugin').SourceMapDevToolPluginOptions;
  /**
   * @param {Compilation} compilation the compiler instance
   * @returns {void}
   */
  apply(compilation: Compilation): void;
}
declare namespace SourceMapDevToolModuleOptionsPlugin {
  export { SourceMapDevToolPluginOptions, Compilation };
}
type SourceMapDevToolPluginOptions =
  import('../declarations/plugins/SourceMapDevToolPlugin').SourceMapDevToolPluginOptions;
type Compilation = import('./Compilation');
