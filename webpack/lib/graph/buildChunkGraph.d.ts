export = buildChunkGraph;
/**
 * This method creates the Chunk graph from the Module graph
 * @param {Compilation} compilation the compilation
 * @param {InputEntrypointsAndModules} inputEntrypointsAndModules chunk groups which are processed with the modules
 * @returns {void}
 */
declare function buildChunkGraph(compilation: Compilation, inputEntrypointsAndModules: InputEntrypointsAndModules): void;
declare namespace buildChunkGraph {
    export { QueueItem, ChunkGroupInfo, BlockChunkGroupConnection, BlockModulesInTuples, BlockModulesInFlattenTuples, BlockModulesMap, MaskByChunk, BlocksWithNestedBlocks, BlockConnections, ChunkGroupInfoMap, AllCreatedChunkGroups, InputEntrypointsAndModules };
}
import type Compilation from "../Compilation";
/**
 * Defines the queue item type used by this module.
 */
type QueueItem = {
    action: number;
    block: DependenciesBlock;
    module: Module;
    chunk: Chunk;
    chunkGroup: ChunkGroup;
    chunkGroupInfo: ChunkGroupInfo;
};
/**
 * Defines the chunk group info type used by this module.
 */
type ChunkGroupInfo = {
    /**
     * the chunk group
     */
    chunkGroup: ChunkGroup;
    /**
     * the runtimes
     */
    runtime: RuntimeSpec;
    /**
     * current minimal set of modules available at this point
     */
    minAvailableModules: bigint | undefined;
    /**
     * enqueued updates to the minimal set of available modules
     */
    availableModulesToBeMerged: bigint[];
    /**
     * modules that were skipped because module is already available in parent chunks (need to reconsider when minAvailableModules changes)
     */
    skippedItems?: Set<Module> | undefined;
    /**
     * referenced modules that where skipped because they were not active in this runtime
     */
    skippedModuleConnections?: Set<[Module, ModuleGraphConnection[]]> | undefined;
    /**
     * set of modules available including modules from this chunk group
     */
    resultingAvailableModules: bigint | undefined;
    /**
     * resultingAvailableModules last passed to children, to detect when it grows
     */
    connectedAvailableModules: bigint | undefined;
    /**
     * set of children chunk groups, that will be revisited when resultingAvailableModules changes
     */
    children: Set<ChunkGroupInfo> | undefined;
    /**
     * set of parent chunk groups, whose resultingAvailableModules intersect to minAvailableModules
     */
    parents: Set<ChunkGroupInfo> | undefined;
    /**
     * set of chunk groups that are the source for minAvailableModules
     */
    availableSources: Set<ChunkGroupInfo> | undefined;
    /**
     * set of chunk groups which depend on the this chunk group as availableSource
     */
    availableChildren: Set<ChunkGroupInfo> | undefined;
    /**
     * next pre order index
     */
    preOrderIndex: number;
    /**
     * next post order index
     */
    postOrderIndex: number;
    /**
     * has a chunk loading mechanism
     */
    chunkLoading: boolean;
    /**
     * create async chunks
     */
    asyncChunks: boolean;
    /**
     * the module that is the dependency of the block
     */
    depModule: Module | null;
    /**
     * Whether to deduplicate to avoid circular references
     */
    circular: boolean;
};
/**
 * Defines the block chunk group connection type used by this module.
 */
type BlockChunkGroupConnection = {
    /**
     * origin chunk group
     */
    originChunkGroupInfo: ChunkGroupInfo;
    /**
     * referenced chunk group
     */
    chunkGroup: ChunkGroup;
};
type BlockModulesInTuples = (Module | ModuleGraphConnection.ConnectionState | ModuleGraphConnection)[];
type BlockModulesInFlattenTuples = (Module | ModuleGraphConnection.ConnectionState | ModuleGraphConnection[])[];
type BlockModulesMap = Map<DependenciesBlock, BlockModulesInFlattenTuples>;
type MaskByChunk = Map<Chunk, bigint>;
type BlocksWithNestedBlocks = Set<DependenciesBlock>;
type BlockConnections = Map<AsyncDependenciesBlock, BlockChunkGroupConnection[]>;
type ChunkGroupInfoMap = Map<ChunkGroup, ChunkGroupInfo>;
type AllCreatedChunkGroups = Set<ChunkGroup>;
type InputEntrypointsAndModules = Map<Entrypoint, Module[]>;
import type DependenciesBlock from "./DependenciesBlock";
import type Module from "../module/Module";
import type Chunk from "./Chunk";
import type ChunkGroup from "./ChunkGroup";
import type { RuntimeSpec } from "../util/runtime";
import ModuleGraphConnection = require("./ModuleGraphConnection");
import type AsyncDependenciesBlock from "./AsyncDependenciesBlock";
import type Entrypoint from "./Entrypoint";
