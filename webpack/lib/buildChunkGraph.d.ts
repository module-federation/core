export = buildChunkGraph;
/**
 * This method creates the Chunk graph from the Module graph
 * @param {Compilation} compilation the compilation
 * @param {InputEntrypointsAndModules} inputEntrypointsAndModules chunk groups which are processed with the modules
 * @returns {void}
 */
declare function buildChunkGraph(compilation: Compilation, inputEntrypointsAndModules: InputEntrypointsAndModules): void;
declare namespace buildChunkGraph {
    export { AsyncDependenciesBlock, Chunk, ChunkGroup, Compilation, DependenciesBlock, DependencyLocation, Entrypoint, Module, ModuleGraph, ConnectionState, Logger, RuntimeSpec, QueueItem, ChunkGroupInfo, BlockChunkGroupConnection, BlockModulesInTuples, BlockModulesInFlattenTuples, BlockModulesMap, MaskByChunk, BlocksWithNestedBlocks, BlockConnections, ChunkGroupInfoMap, AllCreatedChunkGroups, InputEntrypointsAndModules };
}
type AsyncDependenciesBlock = import("./AsyncDependenciesBlock");
type Chunk = import("./Chunk");
type ChunkGroup = import("./ChunkGroup");
type Compilation = import("./Compilation");
type DependenciesBlock = import("./DependenciesBlock");
type DependencyLocation = import("./Dependency").DependencyLocation;
type Entrypoint = import("./Entrypoint");
type Module = import("./Module");
type ModuleGraph = import("./ModuleGraph");
type ConnectionState = import("./ModuleGraphConnection").ConnectionState;
type Logger = import("./logging/Logger").Logger;
type RuntimeSpec = import("./util/runtime").RuntimeSpec;
type QueueItem = {
    action: number;
    block: DependenciesBlock;
    module: Module;
    chunk: Chunk;
    chunkGroup: ChunkGroup;
    chunkGroupInfo: ChunkGroupInfo;
};
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
     * is this chunk group initialized
     */
    initialized: boolean;
    /**
     * current minimal set of modules available at this point
     */
    minAvailableModules: bigint | undefined;
    /**
     * enqueued updates to the minimal set of available modules
     */
    availableModulesToBeMerged: bigint[];
    /**
     * modules that were skipped because module is already available in parent chunks (need to reconsider when minAvailableModules is shrinking)
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
     * set of children chunk groups, that will be revisited when availableModules shrink
     */
    children: Set<ChunkGroupInfo> | undefined;
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
};
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
type BlockModulesInTuples = (Module | ConnectionState | ModuleGraphConnection)[];
type BlockModulesInFlattenTuples = (Module | ConnectionState | ModuleGraphConnection[])[];
type BlockModulesMap = Map<DependenciesBlock, BlockModulesInFlattenTuples>;
type MaskByChunk = Map<Chunk, bigint>;
type BlocksWithNestedBlocks = Set<DependenciesBlock>;
type BlockConnections = Map<AsyncDependenciesBlock, BlockChunkGroupConnection[]>;
type ChunkGroupInfoMap = Map<ChunkGroup, ChunkGroupInfo>;
type AllCreatedChunkGroups = Set<ChunkGroup>;
type InputEntrypointsAndModules = Map<Entrypoint, Module[]>;
import ModuleGraphConnection = require("./ModuleGraphConnection");
