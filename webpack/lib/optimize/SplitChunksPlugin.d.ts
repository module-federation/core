export = SplitChunksPlugin;
declare class SplitChunksPlugin {
  /**
   * @param {OptimizationSplitChunksOptions=} options plugin options
   */
  constructor(options?: OptimizationSplitChunksOptions | undefined);
  /** @type {SplitChunksOptions} */
  options: SplitChunksOptions;
  /** @type {WeakMap<CacheGroupSource, CacheGroup>} */
  _cacheGroupCache: WeakMap<CacheGroupSource, CacheGroup>;
  /**
   * @param {CacheGroupSource} cacheGroupSource source
   * @returns {CacheGroup} the cache group (cached)
   */
  _getCacheGroup(cacheGroupSource: CacheGroupSource): CacheGroup;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace SplitChunksPlugin {
  export {
    OptimizationSplitChunksCacheGroup,
    OptimizationSplitChunksGetCacheGroups,
    OptimizationSplitChunksOptions,
    OptimizationSplitChunksSizes,
    OutputOptions,
    ChunkGraph,
    ChunkGroup,
    AssetInfo,
    PathData,
    Compiler,
    Module,
    ModuleGraph,
    DeterministicGroupingGroupedItemsForModule,
    DeterministicGroupingOptionsForModule,
    SplitChunksSizes,
    ChunkFilterFunction,
    CombineSizeFunction,
    CacheGroupSource,
    CacheGroup,
    FallbackCacheGroup,
    CacheGroupsContext,
    GetCacheGroups,
    GetName,
    SplitChunksOptions,
    ChunksInfoItem,
  };
}
type SplitChunksOptions = {
  chunksFilter: ChunkFilterFunction;
  defaultSizeTypes: string[];
  minSize: SplitChunksSizes;
  minSizeReduction: SplitChunksSizes;
  minRemainingSize: SplitChunksSizes;
  enforceSizeThreshold: SplitChunksSizes;
  maxInitialSize: SplitChunksSizes;
  maxAsyncSize: SplitChunksSizes;
  minChunks: number;
  maxAsyncRequests: number;
  maxInitialRequests: number;
  hidePathInfo: boolean;
  filename: string | ((arg0: PathData, arg1: AssetInfo | undefined) => string);
  automaticNameDelimiter: string;
  getCacheGroups: GetCacheGroups;
  getName: GetName;
  usedExports: boolean;
  fallbackCacheGroup: FallbackCacheGroup;
};
type CacheGroupSource = {
  key?: string | undefined;
  priority?: number | undefined;
  getName?: GetName | undefined;
  chunksFilter?: ChunkFilterFunction | undefined;
  enforce?: boolean | undefined;
  minSize: SplitChunksSizes;
  minSizeReduction: SplitChunksSizes;
  minRemainingSize: SplitChunksSizes;
  enforceSizeThreshold: SplitChunksSizes;
  maxAsyncSize: SplitChunksSizes;
  maxInitialSize: SplitChunksSizes;
  minChunks?: number | undefined;
  maxAsyncRequests?: number | undefined;
  maxInitialRequests?: number | undefined;
  filename?:
    | (string | ((arg0: PathData, arg1: AssetInfo | undefined) => string))
    | undefined;
  idHint?: string | undefined;
  automaticNameDelimiter?: string | undefined;
  reuseExistingChunk?: boolean | undefined;
  usedExports?: boolean | undefined;
};
type CacheGroup = {
  key: string;
  priority?: number | undefined;
  getName?: GetName | undefined;
  chunksFilter?: ChunkFilterFunction | undefined;
  minSize: SplitChunksSizes;
  minSizeReduction: SplitChunksSizes;
  minRemainingSize: SplitChunksSizes;
  enforceSizeThreshold: SplitChunksSizes;
  maxAsyncSize: SplitChunksSizes;
  maxInitialSize: SplitChunksSizes;
  minChunks?: number | undefined;
  maxAsyncRequests?: number | undefined;
  maxInitialRequests?: number | undefined;
  filename?:
    | (string | ((arg0: PathData, arg1: AssetInfo | undefined) => string))
    | undefined;
  idHint?: string | undefined;
  automaticNameDelimiter: string;
  reuseExistingChunk: boolean;
  usedExports: boolean;
  _validateSize: boolean;
  _validateRemainingSize: boolean;
  _minSizeForMaxSize: SplitChunksSizes;
  _conditionalEnforce: boolean;
};
type Compiler = import('../Compiler');
type OptimizationSplitChunksOptions =
  import('../../declarations/WebpackOptions').OptimizationSplitChunksOptions;
type OptimizationSplitChunksCacheGroup =
  import('../../declarations/WebpackOptions').OptimizationSplitChunksCacheGroup;
type OptimizationSplitChunksGetCacheGroups =
  import('../../declarations/WebpackOptions').OptimizationSplitChunksGetCacheGroups;
type OptimizationSplitChunksSizes =
  import('../../declarations/WebpackOptions').OptimizationSplitChunksSizes;
type OutputOptions = import('../../declarations/WebpackOptions').Output;
type ChunkGraph = import('../ChunkGraph');
type ChunkGroup = import('../ChunkGroup');
type AssetInfo = import('../Compilation').AssetInfo;
type PathData = import('../Compilation').PathData;
type Module = import('../Module');
type ModuleGraph = import('../ModuleGraph');
type DeterministicGroupingGroupedItemsForModule =
  import('../util/deterministicGrouping').GroupedItems<Module>;
type DeterministicGroupingOptionsForModule =
  import('../util/deterministicGrouping').Options<Module>;
type SplitChunksSizes = Record<string, number>;
type ChunkFilterFunction = (chunk: Chunk) => boolean | undefined;
type CombineSizeFunction = (a: number, b: number) => number;
type FallbackCacheGroup = {
  chunksFilter: ChunkFilterFunction;
  minSize: SplitChunksSizes;
  maxAsyncSize: SplitChunksSizes;
  maxInitialSize: SplitChunksSizes;
  automaticNameDelimiter: string;
};
type CacheGroupsContext = {
  moduleGraph: ModuleGraph;
  chunkGraph: ChunkGraph;
};
type GetCacheGroups = (
  module: Module,
  context: CacheGroupsContext,
) => CacheGroupSource[];
type GetName = (
  module?: Module | undefined,
  chunks?: Chunk[] | undefined,
  key?: string | undefined,
) => string | undefined;
type ChunksInfoItem = {
  modules: SortableSet<Module>;
  cacheGroup: CacheGroup;
  cacheGroupIndex: number;
  name: string;
  sizes: Record<string, number>;
  chunks: Set<Chunk>;
  reuseableChunks: Set<Chunk>;
  chunksKeys: Set<bigint | Chunk>;
};
import Chunk = require('../Chunk');
import SortableSet = require('../util/SortableSet');
