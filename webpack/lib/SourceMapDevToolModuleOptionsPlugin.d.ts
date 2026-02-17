export = SourceMapDevToolModuleOptionsPlugin;
/** @typedef {import("../declarations/plugins/SourceMapDevToolPlugin").SourceMapDevToolPluginOptions} SourceMapDevToolPluginOptions */
/** @typedef {import("./Compilation")} Compilation */
declare class SourceMapDevToolModuleOptionsPlugin {
  /**
   * @param {SourceMapDevToolPluginOptions} options options
   */
  constructor(options: SourceMapDevToolPluginOptions);
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
type Compilation = import('./Compilation');
type SourceMapDevToolPluginOptions =
  import('../declarations/plugins/SourceMapDevToolPlugin').SourceMapDevToolPluginOptions;
