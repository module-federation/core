export = WatchIgnorePlugin;
declare class WatchIgnorePlugin {
  /**
   * @param {WatchIgnorePluginOptions} options options
   */
  constructor(options: WatchIgnorePluginOptions);
  paths: (string | RegExp)[];
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace WatchIgnorePlugin {
  export { WatchIgnorePluginOptions, Compiler, WatchFileSystem };
}
type Compiler = import('./Compiler');
type WatchIgnorePluginOptions =
  import('../declarations/plugins/WatchIgnorePlugin').WatchIgnorePluginOptions;
type WatchFileSystem = import('./util/fs').WatchFileSystem;
