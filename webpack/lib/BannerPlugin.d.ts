export = BannerPlugin;
declare class BannerPlugin {
  /**
   * @param {BannerPluginArgument} options options object
   */
  constructor(options: BannerPluginArgument);
  options: import('../declarations/plugins/BannerPlugin').BannerPluginOptions;
  banner: import('../declarations/plugins/BannerPlugin').BannerFunction;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace BannerPlugin {
  export {
    BannerFunction,
    BannerPluginArgument,
    BannerPluginOptions,
    Compiler,
  };
}
type Compiler = import('./Compiler');
type BannerPluginArgument =
  import('../declarations/plugins/BannerPlugin').BannerPluginArgument;
type BannerFunction =
  import('../declarations/plugins/BannerPlugin').BannerFunction;
type BannerPluginOptions =
  import('../declarations/plugins/BannerPlugin').BannerPluginOptions;
