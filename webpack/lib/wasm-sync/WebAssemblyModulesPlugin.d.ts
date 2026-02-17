export = WebAssemblyModulesPlugin;
/**
 * @typedef {Object} WebAssemblyModulesPluginOptions
 * @property {boolean} [mangleImports] mangle imports
 */
declare class WebAssemblyModulesPlugin {
  /**
   * @param {WebAssemblyModulesPluginOptions} options options
   */
  constructor(options: WebAssemblyModulesPluginOptions);
  options: WebAssemblyModulesPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace WebAssemblyModulesPlugin {
  export {
    Source,
    OutputOptions,
    Compiler,
    Module,
    ModuleTemplate,
    RenderContext,
    WebAssemblyModulesPluginOptions,
  };
}
type WebAssemblyModulesPluginOptions = {
  /**
   * mangle imports
   */
  mangleImports?: boolean;
};
type Compiler = import('../Compiler');
type Source = any;
type OutputOptions =
  import('../../declarations/WebpackOptions').OutputNormalized;
type Module = import('../Module');
type ModuleTemplate = import('../ModuleTemplate');
type RenderContext =
  import('../javascript/JavascriptModulesPlugin').RenderContext;
