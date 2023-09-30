export = SourceMapDevToolPlugin;
declare class SourceMapDevToolPlugin {
  /**
   * @param {SourceMapDevToolPluginOptions} [options] options object
   * @throws {Error} throws error, if got more than 1 arguments
   */
  constructor(options?: SourceMapDevToolPluginOptions);
  /** @type {string | false} */
  sourceMapFilename: string | false;
  /** @type {string | false | (function(PathData, AssetInfo=): string)}} */
  sourceMappingURLComment:
    | string
    | false
    | ((arg0: PathData, arg1?: AssetInfo | undefined) => string);
  /** @type {string | Function} */
  moduleFilenameTemplate: string | Function;
  /** @type {string | Function} */
  fallbackModuleFilenameTemplate: string | Function;
  /** @type {string} */
  namespace: string;
  /** @type {SourceMapDevToolPluginOptions} */
  options: SourceMapDevToolPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace SourceMapDevToolPlugin {
  export {
    MapOptions,
    Source,
    SourceMapDevToolPluginOptions,
    Etag,
    ItemCacheFacade,
    Chunk,
    Asset,
    AssetInfo,
    PathData,
    Compiler,
    Module,
    SourceMap,
    Hash,
    SourceMapTask,
  };
}
type PathData = import('./Compilation').PathData;
type AssetInfo = import('./Compilation').AssetInfo;
type SourceMapDevToolPluginOptions =
  import('../declarations/plugins/SourceMapDevToolPlugin').SourceMapDevToolPluginOptions;
type Compiler = import('./Compiler');
type MapOptions = any;
type Source = any;
type Etag = import('./Cache').Etag;
type ItemCacheFacade = import('./CacheFacade').ItemCacheFacade;
type Chunk = import('./Chunk');
type Asset = import('./Compilation').Asset;
type Module = import('./Module');
type SourceMap = import('./NormalModule').SourceMap;
type Hash = import('./util/Hash');
type SourceMapTask = {
  asset: any;
  assetInfo: AssetInfo;
  modules: (string | Module)[];
  source: string;
  file: string;
  sourceMap: SourceMap;
  /**
   * cache item
   */
  cacheItem: ItemCacheFacade;
};
