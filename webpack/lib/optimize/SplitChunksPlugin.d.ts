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
    export { OptimizationSplitChunksCacheGroup, OptimizationSplitChunksGetCacheGroups, OptimizationSplitChunksOptions, OptimizationSplitChunksSizes, OutputOptions, ChunkName, ChunkGraph, ChunkGroup, Compiler, Module, SourceType, ModuleGraph, TemplatePath, DeterministicGroupingGroupedItemsForModule, DeterministicGroupingOptionsForModule, ChunkFilterFn, Priority, Size, CountOfChunk, CountOfRequest, CombineSizeFunction, SourceTypes, DefaultSizeTypes, SplitChunksSizes, CacheGroupSource, CacheGroup, FallbackCacheGroup, CacheGroupsContext, GetCacheGroups, GetNameFn, SplitChunksOptions, ChunkSet, ChunksInfoItem };
}
type OptimizationSplitChunksCacheGroup = import("../../declarations/WebpackOptions").OptimizationSplitChunksCacheGroup;
type OptimizationSplitChunksGetCacheGroups = import("../../declarations/WebpackOptions").OptimizationSplitChunksGetCacheGroups;
type OptimizationSplitChunksOptions = import("../../declarations/WebpackOptions").OptimizationSplitChunksOptions;
type OptimizationSplitChunksSizes = import("../../declarations/WebpackOptions").OptimizationSplitChunksSizes;
type OutputOptions = import("../config/defaults").OutputNormalizedWithDefaults;
type ChunkName = import("../Chunk").ChunkName;
type ChunkGraph = import("../ChunkGraph");
type ChunkGroup = import("../ChunkGroup");
type Compiler = import("../Compiler");
type Module = import("../Module");
type SourceType = import("../Module").SourceType;
type ModuleGraph = import("../ModuleGraph");
type TemplatePath = import("../TemplatedPathPlugin").TemplatePath;
type DeterministicGroupingGroupedItemsForModule = import("../util/deterministicGrouping").GroupedItems<Module>;
type DeterministicGroupingOptionsForModule = import("../util/deterministicGrouping").Options<Module>;
type ChunkFilterFn = (chunk: Chunk) => boolean | undefined;
type Priority = number;
type Size = number;
type CountOfChunk = number;
type CountOfRequest = number;
type CombineSizeFunction = (a: Size, b: Size) => Size;
type SourceTypes = SourceType[];
type DefaultSizeTypes = SourceType[];
type SplitChunksSizes = Record<SourceType, Size>;
type CacheGroupSource = {
    key: string;
    priority?: Priority | undefined;
    getName?: GetNameFn | undefined;
    chunksFilter?: ChunkFilterFn | undefined;
    enforce?: boolean | undefined;
    minSize: SplitChunksSizes;
    minSizeReduction: SplitChunksSizes;
    minRemainingSize: SplitChunksSizes;
    enforceSizeThreshold: SplitChunksSizes;
    maxAsyncSize: SplitChunksSizes;
    maxInitialSize: SplitChunksSizes;
    minChunks?: CountOfChunk | undefined;
    maxAsyncRequests?: CountOfRequest | undefined;
    maxInitialRequests?: CountOfRequest | undefined;
    filename?: TemplatePath | undefined;
    idHint?: string | undefined;
    automaticNameDelimiter?: string | undefined;
    reuseExistingChunk?: boolean | undefined;
    usedExports?: boolean | undefined;
};
type CacheGroup = {
    key: string;
    priority: Priority;
    getName?: GetNameFn | undefined;
    chunksFilter: ChunkFilterFn;
    minSize: SplitChunksSizes;
    minSizeReduction: SplitChunksSizes;
    minRemainingSize: SplitChunksSizes;
    enforceSizeThreshold: SplitChunksSizes;
    maxAsyncSize: SplitChunksSizes;
    maxInitialSize: SplitChunksSizes;
    minChunks: CountOfChunk;
    maxAsyncRequests: CountOfRequest;
    maxInitialRequests: CountOfRequest;
    filename?: TemplatePath | undefined;
    idHint: string;
    automaticNameDelimiter: string;
    reuseExistingChunk: boolean;
    usedExports: boolean;
    _validateSize: boolean;
    _validateRemainingSize: boolean;
    _minSizeForMaxSize: SplitChunksSizes;
    _conditionalEnforce: boolean;
};
type FallbackCacheGroup = {
    chunksFilter: ChunkFilterFn;
    minSize: SplitChunksSizes;
    maxAsyncSize: SplitChunksSizes;
    maxInitialSize: SplitChunksSizes;
    automaticNameDelimiter: string;
};
type CacheGroupsContext = {
    moduleGraph: ModuleGraph;
    chunkGraph: ChunkGraph;
};
type GetCacheGroups = (module: Module, context: CacheGroupsContext) => CacheGroupSource[] | null;
type GetNameFn = (module: Module, chunks: Chunk[], key: string) => string | undefined;
type SplitChunksOptions = {
    chunksFilter: ChunkFilterFn;
    defaultSizeTypes: DefaultSizeTypes;
    minSize: SplitChunksSizes;
    minSizeReduction: SplitChunksSizes;
    minRemainingSize: SplitChunksSizes;
    enforceSizeThreshold: SplitChunksSizes;
    maxInitialSize: SplitChunksSizes;
    maxAsyncSize: SplitChunksSizes;
    minChunks: CountOfChunk;
    maxAsyncRequests: CountOfRequest;
    maxInitialRequests: CountOfRequest;
    hidePathInfo: boolean;
    filename?: TemplatePath | undefined;
    automaticNameDelimiter: string;
    getCacheGroups: GetCacheGroups;
    getName: GetNameFn;
    usedExports: boolean;
    fallbackCacheGroup: FallbackCacheGroup;
};
type ChunkSet = Set<Chunk>;
type ChunksInfoItem = {
    modules: SortableSet<Module>;
    cacheGroup: CacheGroup;
    cacheGroupIndex: number;
    name?: string | undefined;
    sizes: SplitChunksSizes;
    chunks: ChunkSet;
    reusableChunks: ChunkSet;
    chunksKeys: Set<bigint | Chunk>;
};
import Chunk = require("../Chunk");
import SortableSet = require("../util/SortableSet");
