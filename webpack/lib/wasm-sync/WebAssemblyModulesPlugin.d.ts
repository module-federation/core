export = WebAssemblyModulesPlugin;
/**
 * @typedef {object} WebAssemblyModulesPluginOptions
 * @property {boolean=} mangleImports mangle imports
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
  export { Compiler, Module, WebAssemblyModulesPluginOptions };
}
type Compiler = import('../Compiler');
type Module = import('../Module');
type WebAssemblyModulesPluginOptions = {
  /**
   * mangle imports
   */
  mangleImports?: boolean | undefined;
};
