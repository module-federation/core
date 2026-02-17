export = SizeLimitsPlugin;
declare class SizeLimitsPlugin {
  /**
   * @param {Entrypoint | ChunkGroup | Source} thing the resource to test
   * @returns {boolean} true if over the limit
   */
  static isOverSizeLimit(thing: Entrypoint | ChunkGroup | Source): boolean;
  /**
   * @param {PerformanceOptions} options the plugin options
   */
  constructor(options: PerformanceOptions);
  hints: false | 'warning' | 'error';
  maxAssetSize: number;
  maxEntrypointSize: number;
  assetFilter: (
    name: import('../Compilation').Asset['name'],
    source: import('../Compilation').Asset['source'],
    assetInfo: import('../Compilation').Asset['info'],
  ) => boolean;
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
    Asset,
    Compiler,
    Entrypoint,
    WebpackError,
    AssetDetails,
    EntrypointDetails,
  };
}
type Source = import('webpack-sources').Source;
type PerformanceOptions =
  import('../../declarations/WebpackOptions').PerformanceOptions;
type ChunkGroup = import('../ChunkGroup');
type Asset = import('../Compilation').Asset;
type Compiler = import('../Compiler');
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
