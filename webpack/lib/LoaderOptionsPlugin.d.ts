export = LoaderOptionsPlugin;
declare class LoaderOptionsPlugin {
  /**
   * @param {LoaderOptionsPluginOptions & MatchObject} options options object
   */
  constructor(options?: LoaderOptionsPluginOptions & MatchObject);
  options: import('../declarations/plugins/LoaderOptionsPlugin').LoaderOptionsPluginOptions &
    ModuleFilenameHelpers.MatchObject;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace LoaderOptionsPlugin {
  export { LoaderOptionsPluginOptions, Compiler, MatchObject };
}
import ModuleFilenameHelpers = require('./ModuleFilenameHelpers');
type Compiler = import('./Compiler');
type LoaderOptionsPluginOptions =
  import('../declarations/plugins/LoaderOptionsPlugin').LoaderOptionsPluginOptions;
type MatchObject = import('./ModuleFilenameHelpers').MatchObject;
