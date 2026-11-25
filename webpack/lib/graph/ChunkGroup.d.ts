export = ChunkGroup;
/**
 * Represents a connected group of chunks along with the parent/child
 * relationships, async blocks, and traversal metadata webpack tracks for it.
 */
declare class ChunkGroup {
    /**
     * Creates a chunk group and initializes the relationship sets and ordering
     * metadata used while building and optimizing the chunk graph.
     * @param {string | ChunkGroupOptions=} options chunk group options passed to chunkGroup
     */
    constructor(options?: (string | ChunkGroupOptions) | undefined);
    /** @type {number} */
    groupDebugId: number;
    /** @type {ChunkGroupOptions} */
    options: ChunkGroupOptions;
    /** @type {SortableSet<ChunkGroup>} */
    _children: SortableSet<ChunkGroup>;
    /** @type {SortableSet<ChunkGroup>} */
    _parents: SortableSet<ChunkGroup>;
    /** @type {SortableSet<ChunkGroup>} */
    _asyncEntrypoints: SortableSet<ChunkGroup>;
    /** @type {SortableSet<AsyncDependenciesBlock>} */
    _blocks: SortableSet<AsyncDependenciesBlock>;
    /** @type {Chunk[]} */
    chunks: Chunk[];
    /** @type {OriginRecord[]} */
    origins: OriginRecord[];
    /** @typedef {Map<Module, number>} OrderIndices */
    /** Indices in top-down order */
    /**
     * @private
     * @type {OrderIndices}
     */
    private _modulePreOrderIndices;
    /** Indices in bottom-up order */
    /**
     * @private
     * @type {OrderIndices}
     */
    private _modulePostOrderIndices;
    /** @type {number | undefined} */
    index: number | undefined;
    /**
     * Merges additional options into the chunk group.
     * Order-based options are combined by taking the higher priority, while
     * unsupported conflicts surface as an explicit error.
     * @param {ChunkGroupOptions} options the chunkGroup options passed to addOptions
     * @returns {void}
     */
    addOptions(options: ChunkGroupOptions): void;
    /**
     * Updates the configured name of the chunk group.
     * @param {string | undefined} value the new name for ChunkGroup
     * @returns {void}
     */
    set name(value: string | undefined);
    /**
     * Returns the configured name of the chunk group, if one was assigned.
     * @returns {ChunkGroupOptions["name"]} returns the ChunkGroup name
     */
    get name(): ChunkGroupOptions["name"];
    /**
     * Returns a debug-only identifier derived from the group's member chunk
     * debug ids. This is primarily useful in diagnostics and assertions.
     * @returns {string} a unique concatenation of chunk debugId's
     */
    get debugId(): string;
    /**
     * Returns an identifier derived from the ids of the chunks currently in
     * the group.
     * @returns {string} a unique concatenation of chunk ids
     */
    get id(): string;
    /**
     * Moves a chunk to the front of the group or inserts it when it is not
     * already present.
     * @param {Chunk} chunk chunk being unshifted
     * @returns {boolean} returns true if attempted chunk shift is accepted
     */
    unshiftChunk(chunk: Chunk): boolean;
    /**
     * Inserts a chunk directly before another chunk that already belongs to the
     * group, preserving the rest of the ordering.
     * @param {Chunk} chunk Chunk being inserted
     * @param {Chunk} before Placeholder/target chunk marking new chunk insertion point
     * @returns {boolean} return true if insertion was successful
     */
    insertChunk(chunk: Chunk, before: Chunk): boolean;
    /**
     * Appends a chunk to the group when it is not already a member.
     * @param {Chunk} chunk chunk being pushed into ChunkGroupS
     * @returns {boolean} returns true if chunk addition was successful.
     */
    pushChunk(chunk: Chunk): boolean;
    /**
     * Replaces one member chunk with another while preserving the group's
     * ordering and avoiding duplicates.
     * @param {Chunk} oldChunk chunk to be replaced
     * @param {Chunk} newChunk New chunk that will be replaced with
     * @returns {boolean | undefined} returns true if the replacement was successful
     */
    replaceChunk(oldChunk: Chunk, newChunk: Chunk): boolean | undefined;
    /**
     * Removes a chunk from this group.
     * @param {Chunk} chunk chunk to remove
     * @returns {boolean} returns true if chunk was removed
     */
    removeChunk(chunk: Chunk): boolean;
    /**
     * Indicates whether this chunk group is loaded as part of the initial page
     * load instead of being created lazily.
     * @returns {boolean} true, when this chunk group will be loaded on initial page load
     */
    isInitial(): boolean;
    /**
     * Returns whether this chunk group is an entrypoint, an async one (e.g. a worker) included.
     * @returns {this is Entrypoint} true for an entrypoint
     */
    isEntrypoint(): this is Entrypoint;
    /**
     * Adds a child chunk group to the current group.
     * @param {ChunkGroup} group chunk group to add
     * @returns {boolean} returns true if chunk group was added
     */
    addChild(group: ChunkGroup): boolean;
    /**
     * Returns the child chunk groups reachable from this group.
     * @returns {ChunkGroup[]} returns the children of this group
     */
    getChildren(): ChunkGroup[];
    getNumberOfChildren(): number;
    get childrenIterable(): SortableSet<ChunkGroup>;
    /**
     * Removes a child chunk group and clears the corresponding parent link on
     * the removed child.
     * @param {ChunkGroup} group the chunk group to remove
     * @returns {boolean} returns true if the chunk group was removed
     */
    removeChild(group: ChunkGroup): boolean;
    /**
     * Records a parent chunk group relationship.
     * @param {ChunkGroup} parentChunk the parent group to be added into
     * @returns {boolean} returns true if this chunk group was added to the parent group
     */
    addParent(parentChunk: ChunkGroup): boolean;
    /**
     * Returns the parent chunk groups that can lead to this group.
     * @returns {ChunkGroup[]} returns the parents of this group
     */
    getParents(): ChunkGroup[];
    getNumberOfParents(): number;
    /**
     * Checks whether the provided group is registered as a parent.
     * @param {ChunkGroup} parent the parent group
     * @returns {boolean} returns true if the parent group contains this group
     */
    hasParent(parent: ChunkGroup): boolean;
    get parentsIterable(): SortableSet<ChunkGroup>;
    /**
     * Removes a parent chunk group and clears the reverse child relationship.
     * @param {ChunkGroup} chunkGroup the parent group
     * @returns {boolean} returns true if this group has been removed from the parent
     */
    removeParent(chunkGroup: ChunkGroup): boolean;
    /**
     * Registers an async entrypoint that is rooted in this chunk group.
     * @param {Entrypoint} entrypoint entrypoint to add
     * @returns {boolean} returns true if entrypoint was added
     */
    addAsyncEntrypoint(entrypoint: Entrypoint): boolean;
    get asyncEntrypointsIterable(): SortableSet<ChunkGroup>;
    /**
     * Returns the async dependency blocks that create or reference this group.
     * @returns {AsyncDependenciesBlock[]} an array containing the blocks
     */
    getBlocks(): AsyncDependenciesBlock[];
    getNumberOfBlocks(): number;
    /**
     * Checks whether an async dependency block is associated with this group.
     * @param {AsyncDependenciesBlock} block block
     * @returns {boolean} true, if block exists
     */
    hasBlock(block: AsyncDependenciesBlock): boolean;
    /**
     * Exposes the group's async dependency blocks as an iterable.
     * @returns {Iterable<AsyncDependenciesBlock>} blocks
     */
    get blocksIterable(): Iterable<AsyncDependenciesBlock>;
    /**
     * Associates an async dependency block with this chunk group.
     * @param {AsyncDependenciesBlock} block a block
     * @returns {boolean} false, if block was already added
     */
    addBlock(block: AsyncDependenciesBlock): boolean;
    /**
     * Records where this chunk group originated from in user code.
     * The origin is used for diagnostics, ordering, and reporting.
     * @param {Module | null} module origin module
     * @param {DependencyLocation} loc location of the reference in the origin module
     * @param {string} request request name of the reference
     * @returns {void}
     */
    addOrigin(module: Module | null, loc: DependencyLocation, request: string): void;
    /**
     * Collects the emitted files produced by every chunk in the group.
     * @returns {string[]} the files contained this chunk group
     */
    getFiles(): string[];
    /**
     * Disconnects this group from its parents, children, and chunks.
     * Child groups are reconnected to this group's parents so the surrounding
     * graph remains intact after removal.
     * @returns {void}
     */
    remove(): void;
    sortItems(): void;
    /**
     * Sorting predicate which allows current ChunkGroup to be compared against another.
     * Sorting values are based off of number of chunks in ChunkGroup.
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {ChunkGroup} otherGroup the chunkGroup to compare this against
     * @returns {-1 | 0 | 1} sort position for comparison
     */
    compareTo(chunkGraph: ChunkGraph, otherGroup: ChunkGroup): -1 | 0 | 1;
    /**
     * Aggregates per-block `*Order` options for the blocks that bridge this
     * chunk group to the given child chunk group. `*Order` options are tied to
     * the originating `import()` call and must not be sourced from the child's
     * shared options, otherwise a webpackPrefetch/Preload directive from one
     * parent would leak into other parents that share the child by name.
     * @param {ChunkGroup} childGroup the child chunk group
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {Record<string, number>} merged `*Order` options for the edge from this group to `childGroup`
     */
    getChildOrderOptions(childGroup: ChunkGroup, chunkGraph: ChunkGraph): Record<string, number>;
    /**
     * Groups child chunk groups by their `*Order` options and sorts each group
     * by descending order and deterministic chunk-group comparison.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {Record<string, ChunkGroup[]>} mapping from children type to ordered list of ChunkGroups
     */
    getChildrenByOrders(moduleGraph: ModuleGraph, chunkGraph: ChunkGraph): Record<string, ChunkGroup[]>;
    /**
     * Stores the module's top-down traversal index within this group.
     * @param {Module} module module for which the index should be set
     * @param {number} index the index of the module
     * @returns {void}
     */
    setModulePreOrderIndex(module: Module, index: number): void;
    /**
     * Returns the module's top-down traversal index within this group.
     * @param {Module} module the module
     * @returns {number | undefined} index
     */
    getModulePreOrderIndex(module: Module): number | undefined;
    /**
     * Stores the module's bottom-up traversal index within this group.
     * @param {Module} module module for which the index should be set
     * @param {number} index the index of the module
     * @returns {void}
     */
    setModulePostOrderIndex(module: Module, index: number): void;
    /**
     * Returns the module's bottom-up traversal index within this group.
     * @param {Module} module the module
     * @returns {number | undefined} index
     */
    getModulePostOrderIndex(module: Module): number | undefined;
    checkConstraints(): void;
    getModuleIndex: (module: Module) => number | undefined;
    getModuleIndex2: (module: Module) => number | undefined;
}
declare namespace ChunkGroup {
    export { OriginRecord, RawChunkGroupOptions, ChunkGroupOptions };
}
import SortableSet = require("../util/SortableSet");
import type AsyncDependenciesBlock from "./AsyncDependenciesBlock";
import type Chunk from "./Chunk";
import type Entrypoint from "./Entrypoint";
import type Module from "../module/Module";
import type { DependencyLocation } from "./Dependency";
import type ChunkGraph from "./ChunkGraph";
import type ModuleGraph from "./ModuleGraph";
type OriginRecord = {
    module: Module | null;
    loc: DependencyLocation;
    request: string;
};
/**
 * Describes the scheduling hints that can be attached to a chunk group.
 * These values influence how child groups are ordered for preload/prefetch
 * and how their fetch priority is exposed to runtime code.
 */
type RawChunkGroupOptions = {
    preloadOrder?: number | undefined;
    prefetchOrder?: number | undefined;
    /**
     * preload only the chunk's CSS (`as="style"`), not its JS
     */
    cssPreloadOrder?: number | undefined;
    fetchPriority?: ("low" | "high" | "auto") | undefined;
};
type ChunkGroupOptions = RawChunkGroupOptions & {
    name?: string | null;
};
