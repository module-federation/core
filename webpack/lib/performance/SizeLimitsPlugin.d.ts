export = SizeLimitsPlugin;
declare class SizeLimitsPlugin {
  /**
   * @param {ChunkGroup | Source} thing the resource to test
   * @returns {boolean} true if over the limit
   */
  static isOverSizeLimit(thing: ChunkGroup | Source): boolean;
  /**
   * @param {PerformanceOptions} options the plugin options
   */
  constructor(options: PerformanceOptions);
  hints: false | 'error' | 'warning';
  maxAssetSize: number;
  maxEntrypointSize: number;
  assetFilter: Function;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace SizeLimitsPlugin {
  export {
    Source,
    PerformanceOptions,
    ChunkGroup,
    Compiler,
    Entrypoint,
    WebpackError,
    AssetDetails,
    EntrypointDetails,
  };
}
type Compiler = import('../Compiler');
type ChunkGroup = import('../ChunkGroup');
type Source = any;
type PerformanceOptions =
  import('../../declarations/WebpackOptions').PerformanceOptions;
type Entrypoint = import('../Entrypoint');
type WebpackError = import('../WebpackError');
type AssetDetails = {
  name: string;
  size: number;
};
type EntrypointDetails = {
  name: string;
  size: number;
  files: string[];
};
