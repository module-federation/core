import type {
  Compiler,
  Compilation,
  Chunk,
  WebpackPluginInstance,
  Module,
} from 'webpack';

export class HoistContainerReferences implements WebpackPluginInstance {
  private readonly containerName: string;

  constructor(name?: string) {
    this.containerName = name || 'no known chunk name';
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'HoistContainerReferences',
      (compilation: Compilation) => {
        compilation.hooks.afterOptimizeChunks.tap(
          'HoistContainerReferences',
          () => {
            const runtimeChunks = this.getRuntimeChunks(compilation);
            this.hoistModulesInChunks(compilation, runtimeChunks);
          },
        );
      },
    );
  }
  private getAllReferencedModules(compilation: Compilation, module: Module) {
    const collectedModules = new Set<Module>([module]);
    const collectOutgoingConnections = (module: Module) => {
      const mgm = compilation.moduleGraph._getModuleGraphModule(module);
      if (mgm && mgm.outgoingConnections) {
        for (const connection of mgm.outgoingConnections) {
          if (connection?.module && !collectedModules.has(connection.module)) {
            collectedModules.add(connection.module);
            collectOutgoingConnections(connection.module);
          }
        }
      }
    };

    if (module) {
      collectOutgoingConnections(module);
    }
    return collectedModules;
  }

  private hoistModulesInChunks(
    compilation: Compilation,
    runtimeChunks: Set<Chunk>,
  ): void {
    const { chunkGraph } = compilation;
    const partialChunk = this.containerName
      ? compilation.namedChunks.get(this.containerName)
      : undefined;

    if (!partialChunk) return;

    const modulesToHoist = new Set<Module>();
    const runtimeModule = compilation.moduleGraph.getModule(
      partialChunk.entryModule.dependencies[1],
    );
    const getEntryReferences = this.getAllReferencedModules(
      compilation,
      partialChunk.entryModule,
    );

    if (runtimeModule) {
      const allReferencedModules = this.getAllReferencedModules(
        compilation,
        runtimeModule,
      );

      for (const chunk of runtimeChunks) {
        for (const module of allReferencedModules) {
          if (!chunkGraph.isModuleInChunk(module, chunk)) {
            compilation.chunkGraph.connectChunkAndModule(chunk, module);
          }
        }
      }

      for (const module of compilation.chunkGraph.getChunkModulesIterable(
        partialChunk,
      )) {
        if (module instanceof compilation.compiler.webpack.ExternalModule) {
          allReferencedModules.add(module);
        }
      }

      this.cleanUpChunks(compilation, allReferencedModules);
    }
  }

  private cleanUpChunks(compilation: Compilation, modules: Set<Module>): void {
    const { chunkGraph } = compilation;
    for (const module of modules) {
      for (const chunk of chunkGraph.getModuleChunks(module)) {
        if (!chunk.hasRuntime()) {
          chunkGraph.disconnectChunkAndModule(chunk, module);
          if (
            chunkGraph.getNumberOfChunkModules(chunk) === 0 &&
            chunkGraph.getNumberOfEntryModules(chunk) === 0
          ) {
            chunkGraph.disconnectChunk(chunk);
            compilation.chunks.delete(chunk);
          }
        }
      }
    }
    modules.clear();
  }

  private getRuntimeChunks(compilation: Compilation): Set<Chunk> {
    const runtimeChunks = new Set<Chunk>();
    const entries = compilation.entrypoints;

    for (const entrypoint of entries.values()) {
      const runtimeChunk = entrypoint.getRuntimeChunk();
      if (runtimeChunk) {
        runtimeChunks.add(runtimeChunk);
      }
    }
    return runtimeChunks;
  }
}

export default HoistContainerReferences;
