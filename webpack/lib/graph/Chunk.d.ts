export = Chunk;
/**
 * A Chunk is a unit of encapsulation for Modules.
 * Chunks are "rendered" into bundles that get emitted when the build completes.
 */
declare class Chunk {
    /**
     * Creates an instance of Chunk.
     * @param {ChunkName=} name of chunk being created, is optional (for subclasses)
     * @param {boolean} backCompat enable backward-compatibility
     */
    constructor(name?: ChunkName | undefined, backCompat?: boolean);
    /** @type {ChunkId | null} */
    id: ChunkId | null;
    /** @type {ChunkId[] | null} */
    ids: ChunkId[] | null;
    /** @type {number} */
    debugId: number;
    /** @type {ChunkName | undefined} */
    name: ChunkName | undefined;
    /** @type {IdNameHints} */
    idNameHints: IdNameHints;
    /** @type {boolean} */
    preventIntegration: boolean;
    /** @type {ChunkFilenameTemplate | undefined} */
    filenameTemplate: ChunkFilenameTemplate | undefined;
    /** @type {ChunkFilenameTemplate | undefined} */
    cssFilenameTemplate: ChunkFilenameTemplate | undefined;
    /**
     * @private
     * @type {SortableChunkGroups}
     */
    private _groups;
    /** @type {RuntimeSpec} */
    runtime: RuntimeSpec;
    /** @type {Set<string>} */
    files: Set<string>;
    /** @type {Set<string>} */
    auxiliaryFiles: Set<string>;
    /** @type {boolean} */
    rendered: boolean;
    /** @type {string=} */
    hash: string | undefined;
    /** @type {Record<string, string>} */
    contentHash: Record<string, string>;
    /** @type {Record<string, string>} */
    contentHashFull: Record<string, string>;
    /** @type {string=} */
    renderedHash: string | undefined;
    /** @type {string=} */
    chunkReason: string | undefined;
    /** @type {boolean} */
    extraAsync: boolean;
    /**
     * Returns entry module.
     * @deprecated
     * @returns {Module | undefined} entry module
     */
    get entryModule(): Module | undefined;
    /**
     * Checks whether this chunk has an entry module.
     * @deprecated
     * @returns {boolean} true, if the chunk contains an entry module
     */
    hasEntryModule(): boolean;
    /**
     * Adds the provided module to the chunk.
     * @deprecated
     * @param {Module} module the module
     * @returns {boolean} true, if the chunk could be added
     */
    addModule(module: Module): boolean;
    /**
     * Removes the provided module from the chunk.
     * @deprecated
     * @param {Module} module the module
     * @returns {void}
     */
    removeModule(module: Module): void;
    /**
     * Gets the number of modules in this chunk.
     * @deprecated
     * @returns {number} the number of module which are contained in this chunk
     */
    getNumberOfModules(): number;
    /**
     * @deprecated
     * @returns {Iterable<Module>} modules
     */
    get modulesIterable(): Iterable<Module>;
    /**
     * Compares this chunk with another chunk.
     * @deprecated
     * @param {Chunk} otherChunk the chunk to compare with
     * @returns {-1 | 0 | 1} the comparison result
     */
    compareTo(otherChunk: Chunk): -1 | 0 | 1;
    /**
     * Checks whether this chunk contains the module.
     * @deprecated
     * @param {Module} module the module
     * @returns {boolean} true, if the chunk contains the module
     */
    containsModule(module: Module): boolean;
    /**
     * Returns the modules for this chunk.
     * @deprecated
     * @returns {Module[]} the modules for this chunk
     */
    getModules(): Module[];
    /**
     * Removes this chunk from the chunk graph and chunk groups.
     * @deprecated
     * @returns {void}
     */
    remove(): void;
    /**
     * Moves a module from this chunk to another chunk.
     * @deprecated
     * @param {Module} module the module
     * @param {Chunk} otherChunk the target chunk
     * @returns {void}
     */
    moveModule(module: Module, otherChunk: Chunk): void;
    /**
     * Integrates another chunk into this chunk when possible.
     * @deprecated
     * @param {Chunk} otherChunk the other chunk
     * @returns {boolean} true, if the specified chunk has been integrated
     */
    integrate(otherChunk: Chunk): boolean;
    /**
     * Checks whether this chunk can be integrated with another chunk.
     * @deprecated
     * @param {Chunk} otherChunk the other chunk
     * @returns {boolean} true, if chunks could be integrated
     */
    canBeIntegrated(otherChunk: Chunk): boolean;
    /**
     * Checks whether this chunk is empty.
     * @deprecated
     * @returns {boolean} true, if this chunk contains no module
     */
    isEmpty(): boolean;
    /**
     * Returns the total size of all modules in this chunk.
     * @deprecated
     * @returns {number} total size of all modules in this chunk
     */
    modulesSize(): number;
    /**
     * Returns the estimated size for the requested source type.
     * @deprecated
     * @param {ChunkSizeOptions} options options object
     * @returns {number} total size of this chunk
     */
    size(options?: ChunkGraph.ChunkSizeOptions): number;
    /**
     * Returns the integrated size with another chunk.
     * @deprecated
     * @param {Chunk} otherChunk the other chunk
     * @param {ChunkSizeOptions} options options object
     * @returns {number} total size of the chunk or false if the chunk can't be integrated
     */
    integratedSize(otherChunk: Chunk, options: ChunkGraph.ChunkSizeOptions): number;
    /**
     * Gets chunk module maps.
     * @deprecated
     * @param {ModuleFilterPredicate} filterFn function used to filter modules
     * @returns {ChunkModuleMaps} module map information
     */
    getChunkModuleMaps(filterFn: ChunkGraph.ModuleFilterPredicate): ChunkModuleMaps;
    /**
     * Checks whether this chunk contains a matching module in the graph.
     * @deprecated
     * @param {ModuleFilterPredicate} filterFn predicate function used to filter modules
     * @param {ChunkFilterPredicate=} filterChunkFn predicate function used to filter chunks
     * @returns {boolean} return true if module exists in graph
     */
    hasModuleInGraph(filterFn: ChunkGraph.ModuleFilterPredicate, filterChunkFn?: ChunkGraph.ChunkFilterPredicate | undefined): boolean;
    /**
     * Returns the chunk map information.
     * @deprecated
     * @param {boolean} realHash whether the full hash or the rendered hash is to be used
     * @returns {ChunkMaps} the chunk map information
     */
    getChunkMaps(realHash: boolean): ChunkMaps;
    /**
     * Checks whether this chunk has runtime.
     * @returns {boolean} whether or not the Chunk will have a runtime
     */
    hasRuntime(): boolean;
    /**
     * Returns whether this chunk carries a hot update rather than regular output.
     * @returns {boolean} true for a hot update chunk
     */
    isHotUpdate(): boolean;
    /**
     * Checks whether it can be initial.
     * @returns {boolean} whether or not this chunk can be an initial chunk
     */
    canBeInitial(): boolean;
    /**
     * Checks whether this chunk is only initial.
     * @returns {boolean} whether this chunk can only be an initial chunk
     */
    isOnlyInitial(): boolean;
    /**
     * Gets entry options.
     * @returns {EntryOptions | undefined} the entry options for this chunk
     */
    getEntryOptions(): Entrypoint.EntryOptions | undefined;
    /**
     * Adds the provided chunk group to the chunk.
     * @param {ChunkGroup} chunkGroup the chunkGroup the chunk is being added
     * @returns {void}
     */
    addGroup(chunkGroup: ChunkGroup): void;
    /**
     * Removes the provided chunk group from the chunk.
     * @param {ChunkGroup} chunkGroup the chunkGroup the chunk is being removed from
     * @returns {void}
     */
    removeGroup(chunkGroup: ChunkGroup): void;
    /**
     * Checks whether this chunk is in group.
     * @param {ChunkGroup} chunkGroup the chunkGroup to check
     * @returns {boolean} returns true if chunk has chunkGroup reference and exists in chunkGroup
     */
    isInGroup(chunkGroup: ChunkGroup): boolean;
    /**
     * Gets number of groups.
     * @returns {number} the amount of groups that the said chunk is in
     */
    getNumberOfGroups(): number;
    /**
     * Gets groups iterable.
     * @returns {SortableChunkGroups} the chunkGroups that the said chunk is referenced in
     */
    get groupsIterable(): SortableChunkGroups;
    /**
     * Disconnects from groups.
     * @returns {void}
     */
    disconnectFromGroups(): void;
    /**
     * Processes the provided new chunk.
     * @param {Chunk} newChunk the new chunk that will be split out of
     * @returns {void}
     */
    split(newChunk: Chunk): void;
    /**
     * Updates the hash with the data contributed by this instance.
     * @param {Hash} hash hash (will be modified)
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {void}
     */
    updateHash(hash: Hash, chunkGraph: ChunkGraph): void;
    /**
     * Gets the chunks shared by every group of this chunk.
     * @private
     * @returns {Chunks} a new set of the chunks in all groups
     */
    private _getChunksInAllGroups;
    /**
     * Gets all async chunks.
     * @returns {Chunks} a set of all the async chunks
     */
    getAllAsyncChunks(): Chunks;
    /**
     * Gets all initial chunks.
     * @returns {Chunks} a set of all the initial chunks (including itself)
     */
    getAllInitialChunks(): Chunks;
    /**
     * Gets all referenced chunks.
     * @returns {Chunks} a set of all the referenced chunks (including itself)
     */
    getAllReferencedChunks(): Chunks;
    /**
     * Gets all referenced async entrypoints.
     * @returns {Entrypoints} a set of all the referenced entrypoints
     */
    getAllReferencedAsyncEntrypoints(): Entrypoints;
    /**
     * Checks whether this chunk has async chunks.
     * @returns {boolean} true, if the chunk references async chunks
     */
    hasAsyncChunks(): boolean;
    /**
     * Gets child ids by orders.
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {ChunkFilterPredicate=} filterFn function used to filter chunks
     * @returns {Record<string, ChunkId[]>} a record object of names to lists of child ids(?)
     */
    getChildIdsByOrders(chunkGraph: ChunkGraph, filterFn?: ChunkGraph.ChunkFilterPredicate | undefined): Record<string, ChunkId[]>;
    /**
     * Gets children of type in order.
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {string} type option name
     * @returns {ChunkChildOfTypeInOrder[] | undefined} referenced chunks for a specific type
     */
    getChildrenOfTypeInOrder(chunkGraph: ChunkGraph, type: string): ChunkChildOfTypeInOrder[] | undefined;
    /**
     * Gets child ids by orders map.
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {boolean=} includeDirectChildren include direct children (by default only children of async children are included)
     * @param {ChunkFilterPredicate=} filterFn function used to filter chunks
     * @returns {ChunkChildIdsByOrdersMapByData} a record object of names to lists of child ids(?) by chunk id
     */
    getChildIdsByOrdersMap(chunkGraph: ChunkGraph, includeDirectChildren?: boolean | undefined, filterFn?: ChunkGraph.ChunkFilterPredicate | undefined): ChunkChildIdsByOrdersMapByData;
    /**
     * Checks whether this chunk contains the chunk graph.
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {string} type option name
     * @param {boolean=} includeDirectChildren include direct children (by default only children of async children are included)
     * @param {ChunkFilterPredicate=} filterFn function used to filter chunks
     * @returns {boolean} true when the child is of type order, otherwise false
     */
    hasChildByOrder(chunkGraph: ChunkGraph, type: string, includeDirectChildren?: boolean | undefined, filterFn?: ChunkGraph.ChunkFilterPredicate | undefined): boolean;
}
declare namespace Chunk {
    export { ChunkFilenameTemplateFn, ChunkFilenameTemplate, ChunkName, ChunkId, IdNameHints, ChunkMaps, ChunkModuleIdMap, chunkModuleHashMap, ChunkModuleMaps, Chunks, Entrypoints, Queue, SortableChunkGroups, ChunkChildIdsByOrdersMap, ChunkChildIdsByOrdersMapByData, ChunkChildOfTypeInOrder };
}
import type { RuntimeSpec } from "../util/runtime";
import type Module from "../module/Module";
import ChunkGraph = require("./ChunkGraph");
import type Entrypoint from "./Entrypoint";
import type ChunkGroup from "./ChunkGroup";
import type Hash from "../util/Hash";
type ChunkFilenameTemplateFn = import("../template/TemplatedPathPlugin").TemplatePathFn<PathDataChunk>;
type ChunkFilenameTemplate = string | ChunkFilenameTemplateFn;
type ChunkName = string | null;
type ChunkId = string | number;
type IdNameHints = SortableSet<string>;
/**
 * Defines the chunk maps type used by this module.
 */
type ChunkMaps = {
    hash: Record<ChunkId, string>;
    contentHash: Record<ChunkId, Record<string, string>>;
    name: Record<ChunkId, string>;
};
/**
 * Defines the chunk module id map type used by this module.
 */
type ChunkModuleIdMap = Record<ChunkId, ChunkId[]>;
/**
 * Defines the chunk module hash map type used by this module.
 */
type chunkModuleHashMap = Record<ChunkGraph.ModuleId, string>;
/**
 * Defines the chunk module maps type used by this module.
 */
type ChunkModuleMaps = {
    id: ChunkModuleIdMap;
    hash: chunkModuleHashMap;
};
type Chunks = Set<Chunk>;
type Entrypoints = Set<Entrypoint>;
type Queue = Set<ChunkGroup>;
type SortableChunkGroups = SortableSet<ChunkGroup>;
type ChunkChildIdsByOrdersMap = Record<string, ChunkId[]>;
type ChunkChildIdsByOrdersMapByData = Record<string, ChunkChildIdsByOrdersMap>;
type ChunkChildOfTypeInOrder = {
    onChunks: Chunk[];
    chunks: Chunks;
};
import type { PathDataChunk } from "../Compilation";
import SortableSet = require("../util/SortableSet");
