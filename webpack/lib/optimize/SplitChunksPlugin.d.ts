export = SplitChunksPlugin;
declare class SplitChunksPlugin {
    /**
     * Creates an instance of SplitChunksPlugin.
     * @param {OptimizationSplitChunksOptions=} options plugin options
     */
    constructor(options?: OptimizationSplitChunksOptions | undefined);
    /** @type {SplitChunksOptions} */
    options: SplitChunksOptions;
    /** @type {WeakMap<CacheGroupSource, CacheGroup>} */
    _cacheGroupCache: WeakMap<CacheGroupSource, CacheGroup>;
    /** @type {StaticCacheGroupSource[]} */
    _staticCacheGroupSources: StaticCacheGroupSource[];
    _hasDynamicCacheGroups: boolean;
    /**
     * Settings for the intersections a chunk set discovers, or `undefined` when no
     * cache group would take one.
     * @param {boolean} usedExports true for the sets grouped by used exports
     * @param {number} dedupDepth rounds of discovery this compilation allows
     * @returns {IntersectionSettings | undefined} the settings, when discovery applies
     */
    _getIntersectionSettings(usedExports: boolean, dedupDepth: number): IntersectionSettings | undefined;
    /**
     * Returns the cache group (cached).
     * @param {CacheGroupSource} cacheGroupSource source
     * @returns {CacheGroup} the cache group (cached)
     */
    _getCacheGroup(cacheGroupSource: CacheGroupSource): CacheGroup;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace SplitChunksPlugin {
    export { getCappedSplits, DeterministicGroupingGroupedItemsForModule, DeterministicGroupingOptionsForModule, ChunkFilterFn, Priority, Size, CountOfChunk, CountOfRequest, CombineSizeFunction, SourceTypes, DefaultSizeTypes, SplitChunksSizes, CacheGroupSource, CacheGroup, FallbackCacheGroup, CacheGroupsContext, RawGetCacheGroups, GetCacheGroups, GetNameFn, SplitChunksOptions, IntersectionCacheGroup, IntersectionSettings, ChunkSet, ChunksInfoItem, CappedSplit, StaticCacheGroupSource, NormalizedCacheGroups, CheckTestFn, CheckModuleTypeFn, CheckModuleLayerFn };
}
import type Compiler from "../Compiler";
import type { OptimizationSplitChunksOptions } from "../../declarations/WebpackOptions";
/**
 * Reads back the splits a request cap refused during this compilation.
 * @param {Compilation} compilation the compilation
 * @returns {CappedSplit[] | undefined} the refused splits, or `undefined` when nothing recorded them
 */
declare function getCappedSplits(compilation: Compilation): CappedSplit[] | undefined;
type DeterministicGroupingGroupedItemsForModule = import("./deterministicGrouping").GroupedItems<Module>;
type DeterministicGroupingOptionsForModule = import("./deterministicGrouping").Options<Module>;
/**
 * Defines the chunk filter fn callback.
 */
type ChunkFilterFn = (chunk: Chunk) => boolean | undefined;
type Priority = number;
type Size = number;
type CountOfChunk = number;
type CountOfRequest = number;
/**
 * Defines the combine size function callback.
 */
type CombineSizeFunction = (a: Size, b: Size) => Size;
type SourceTypes = Module.SourceType[];
type DefaultSizeTypes = Module.SourceType[];
type SplitChunksSizes = Record<Module.SourceType, Size>;
/**
 * Defines the cache group source type used by this module.
 */
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
    filename?: Chunk.ChunkFilenameTemplate | undefined;
    idHint?: string | undefined;
    automaticNameDelimiter?: string | undefined;
    reuseExistingChunk?: boolean | undefined;
    usedExports?: boolean | undefined;
};
/**
 * Defines the cache group type used by this module.
 */
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
    filename?: Chunk.ChunkFilenameTemplate | undefined;
    idHint: string;
    automaticNameDelimiter: string;
    reuseExistingChunk: boolean;
    usedExports: boolean;
    _validateSize: boolean;
    _validateSizeReduction: boolean;
    _validateRemainingSize: boolean;
    _minSizeForMaxSize: SplitChunksSizes;
    _conditionalEnforce: boolean;
};
/**
 * Defines the fallback cache group type used by this module.
 */
type FallbackCacheGroup = {
    chunksFilter: ChunkFilterFn;
    minSize: SplitChunksSizes;
    maxAsyncSize: SplitChunksSizes;
    maxInitialSize: SplitChunksSizes;
    automaticNameDelimiter: string;
};
/**
 * Defines the cache groups context type used by this module.
 */
type CacheGroupsContext = {
    moduleGraph: ModuleGraph;
    chunkGraph: ChunkGraph;
};
type RawGetCacheGroups = (module: Module) => OptimizationSplitChunksCacheGroup | OptimizationSplitChunksCacheGroup[] | void;
/**
 * Defines the get cache groups callback.
 */
type GetCacheGroups = (module: Module, context: CacheGroupsContext) => CacheGroupSource[] | null;
/**
 * Defines the get name fn callback.
 */
type GetNameFn = (module: Module, chunks: Chunk[], key: string) => string | undefined;
/**
 * Defines the split chunks options type used by this module.
 */
type SplitChunksOptions = {
    dedupDepth: number | undefined;
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
    filename?: Chunk.ChunkFilenameTemplate | undefined;
    automaticNameDelimiter: string;
    getCacheGroups: GetCacheGroups;
    getName: GetNameFn;
    usedExports: boolean;
    fallbackCacheGroup: FallbackCacheGroup;
};
/**
 * A cache group as intersection discovery reads it: what it takes, and how much
 * the modules it would take have to weigh.
 */
type IntersectionCacheGroup = {
    /**
     * the modules it accepts
     */
    test: OptimizationSplitChunksCacheGroup["test"];
    /**
     * the size each of their types must reach
     */
    minSize: SplitChunksSizes;
};
/**
 * What the cache groups taking intersections allow discovery to assume.
 */
type IntersectionSettings = {
    /**
     * size an intersection's modules must reach, `0` when unbounded
     */
    minSize: number;
    /**
     * fewest chunks an intersection is worth discovering with
     */
    minMembers: number;
    /**
     * the cache groups taking them, when every one of them is known
     */
    groups: IntersectionCacheGroup[] | undefined;
};
type ChunkSet = Set<Chunk>;
/**
 * Defines the chunks info item type used by this module.
 */
type ChunksInfoItem = {
    modules: SortableSet<Module>;
    cacheGroup: CacheGroup;
    cacheGroupIndex: number;
    name?: string | undefined;
    sizes: SplitChunksSizes;
    chunks: ChunkSet;
    chunksKeys: Set<bigint | Chunk>;
};
/**
 * A split `maxInitialRequests`/`maxAsyncRequests` refused, recorded for
 * `performance.splitChunksCapped`.
 */
type CappedSplit = {
    /**
     * the cache group whose split was refused
     */
    cacheGroup: string;
    /**
     * the chunk it would have been taken out of
     */
    chunk: Chunk;
    /**
     * the option that refused it
     */
    limit: "maxAsyncRequests" | "maxInitialRequests";
    /**
     * the value that option had
     */
    maxRequests: number;
    /**
     * how many modules the split would have moved
     */
    modules: number;
};
/**
 * A cache group source a module can only match or not, and what decides it.
 */
type StaticCacheGroupSource = {
    /**
     * the normalized source
     */
    source: CacheGroupSource;
    /**
     * the modules it accepts
     */
    test: OptimizationSplitChunksCacheGroup["test"];
};
/**
 * The normalized cache groups, and what is known about them without a module.
 */
type NormalizedCacheGroups = {
    /**
     * a function to get the cache groups
     */
    getCacheGroups: GetCacheGroups;
    /**
     * the sources a module can only match or not
     */
    staticSources: StaticCacheGroupSource[];
    /**
     * true when a callback builds sources per module
     */
    hasDynamicSources: boolean;
};
type CheckTestFn = (module: Module, context: CacheGroupsContext) => boolean;
type CheckModuleTypeFn = (type: string) => boolean;
type CheckModuleLayerFn = (layer: string | null) => boolean;
import type Compilation from "../Compilation";
import type Module from "../module/Module";
import type Chunk from "../graph/Chunk";
import type ModuleGraph from "../graph/ModuleGraph";
import type ChunkGraph from "../graph/ChunkGraph";
import type { OptimizationSplitChunksCacheGroup } from "../../declarations/WebpackOptions";
import SortableSet = require("../util/SortableSet");
