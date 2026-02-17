export = APIPlugin;
/**
 * @typedef {Object} APIPluginOptions
 * @property {boolean} [module] the output filename
 */
declare class APIPlugin {
  /**
   * @param {APIPluginOptions} [options] options
   */
  constructor(options?: APIPluginOptions);
  options: APIPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace APIPlugin {
  export { Compiler, JavascriptParser, APIPluginOptions };
}
type APIPluginOptions = {
  /**
   * the output filename
   */
  module?: boolean;
};
type Compiler = import('./Compiler');
type JavascriptParser = import('./javascript/JavascriptParser');
