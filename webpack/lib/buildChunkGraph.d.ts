export = buildChunkGraph;
/**
 * This method creates the Chunk graph from the Module graph
 * @param {Compilation} compilation the compilation
 * @param {Map<Entrypoint, Module[]>} inputEntrypointsAndModules chunk groups which are processed with the modules
 * @returns {void}
 */
declare function buildChunkGraph(
  compilation: Compilation,
  inputEntrypointsAndModules: Map<Entrypoint, Module[]>,
): void;
declare namespace buildChunkGraph {
  export {
    AsyncDependenciesBlock,
    Chunk,
    ChunkGroup,
    Compilation,
    DependenciesBlock,
    Dependency,
    DependencyLocation,
    Entrypoint,
    Module,
    ModuleGraph,
    ConnectionState,
    Logger,
    RuntimeSpec,
    QueueItem,
    ModuleSetPlus,
    ChunkGroupInfo,
    BlockChunkGroupConnection,
  };
}
type Compilation = import('./Compilation');
type Entrypoint = import('./Entrypoint');
type Module = import('./Module');
type AsyncDependenciesBlock = import('./AsyncDependenciesBlock');
type Chunk = import('./Chunk');
type ChunkGroup = import('./ChunkGroup');
type DependenciesBlock = import('./DependenciesBlock');
type Dependency = import('./Dependency');
type DependencyLocation = import('./Dependency').DependencyLocation;
type ModuleGraph = import('./ModuleGraph');
type ConnectionState = import('./ModuleGraphConnection').ConnectionState;
type Logger = import('./logging/Logger').Logger;
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
type QueueItem = {
  action: number;
  block: DependenciesBlock;
  module: Module;
  chunk: Chunk;
  chunkGroup: ChunkGroup;
  chunkGroupInfo: ChunkGroupInfo;
};
type ModuleSetPlus = Set<Module> & {
  plus: Set<Module>;
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
   * current minimal set of modules available at this point
   */
  minAvailableModules: ModuleSetPlus | undefined;
  /**
   * true, if minAvailableModules is owned and can be modified
   */
  minAvailableModulesOwned: boolean | undefined;
  /**
   * enqueued updates to the minimal set of available modules
   */
  availableModulesToBeMerged: ModuleSetPlus[];
  /**
   * modules that were skipped because module is already available in parent chunks (need to reconsider when minAvailableModules is shrinking)
   */
  skippedItems?: Set<Module> | undefined;
  /**
   * referenced modules that where skipped because they were not active in this runtime
   */
  skippedModuleConnections?: Set<[Module, ConnectionState]> | undefined;
  /**
   * set of modules available including modules from this chunk group
   */
  resultingAvailableModules: ModuleSetPlus | undefined;
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
