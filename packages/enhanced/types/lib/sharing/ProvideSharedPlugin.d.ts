export = ProvideSharedPlugin;
/**
 * @typedef {Object} ProvideOptions
 * @property {string} shareKey
 * @property {string} shareScope
 * @property {string | undefined | false} version
 * @property {boolean} eager
 */
/** @typedef {Map<string, { config: ProvideOptions, version: string | undefined | false }>} ResolvedProvideMap */
declare class ProvideSharedPlugin {
  /**
   * @param {ProvideSharedPluginOptions} options options
   */
  constructor(options: any);
  _provides: [string, ProvideOptions][];
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ProvideSharedPlugin {
  export {
    ProvideSharedPluginOptions,
    Compilation,
    Compiler,
    ProvideOptions,
    ResolvedProvideMap,
  };
}
type ProvideOptions = {
  shareKey: string;
  shareScope: string;
  version: string | undefined | false;
  eager: boolean;
};
type Compiler = import('webpack/lib/Compiler');
type ProvideSharedPluginOptions = any;
type Compilation = import('webpack/lib/Compilation');
type ResolvedProvideMap = Map<
  string,
  {
    config: ProvideOptions;
    version: string | undefined | false;
  }
>;
