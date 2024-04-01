export = IgnorePlugin;
declare class IgnorePlugin {
  /**
   * @param {IgnorePluginOptions} options IgnorePlugin options
   */
  constructor(options: IgnorePluginOptions);
  options: import('../declarations/plugins/IgnorePlugin').IgnorePluginOptions;
  /**
   * Note that if "contextRegExp" is given, both the "resourceRegExp"
   * and "contextRegExp" have to match.
   *
   * @param {ResolveData} resolveData resolve data
   * @returns {false|undefined} returns false when the request should be ignored, otherwise undefined
   */
  checkIgnore(resolveData: ResolveData): false | undefined;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace IgnorePlugin {
  export { IgnorePluginOptions, Compiler, ResolveData };
}
type ResolveData = import('./NormalModuleFactory').ResolveData;
type Compiler = import('./Compiler');
type IgnorePluginOptions =
  import('../declarations/plugins/IgnorePlugin').IgnorePluginOptions;
