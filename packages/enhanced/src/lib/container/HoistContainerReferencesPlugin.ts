import type {
  Compiler,
  Compilation,
  Chunk,
  WebpackPluginInstance,
  Module,
} from 'webpack';
import ContainerEntryModule from './ContainerEntryModule';

const getRuntime = (chunk: Chunk) => {
  if (typeof chunk.runtime === 'string') {
    return [chunk.runtime];
  } else if (chunk.runtime === undefined) {
    return [];
  } else {
    return Array.from(chunk.runtime);
  }
};

/**
 * This class is used to hoist container references in the code.
 * @constructor
 */
export class HoistContainerReferences implements WebpackPluginInstance {
  private containerEntryModules: Set<ContainerEntryModule>;

  constructor() {
    this.containerEntryModules = new Set<ContainerEntryModule>();
  }

  public getContainerEntryModules(): Set<ContainerEntryModule> {
    return this.containerEntryModules;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'HoistContainerReferences',
      (compilation: Compilation) => {
        compilation.hooks.optimizeChunkModules.tap(
          'HoistContainerReferences',
          (chunks: Iterable<Chunk>) => {
            const realContainers: Map<Chunk['name'], Chunk> = new Map();
            for (const chunk of chunks) {
              if (this.chunkContainsContainerEntryModule(chunk, compilation)) {
                realContainers.set(chunk.name, chunk);
              }
            }

            for (const chunk of chunks) {
              if (realContainers.has(chunk.name)) continue;
              this.clearEntry(chunk, compilation, realContainers);
            }
          },
        );
        // compilation.hooks.afterOptimizeChunks.tap(
        //   'HoistContainerReferences',
        //   (chunks: Iterable<Chunk>) => {
        //     const realContainers: Map<Chunk['name'], Chunk> = new Map();
        //     for (const chunk of chunks) {
        //       if (this.chunkContainsContainerEntryModule(chunk, compilation)) {
        //         realContainers.set(chunk.name, chunk);
        //       }
        //     }
        //     for (const chunk of chunks) {
        //       if (realContainers.has(chunk.name)) continue;
        //       this.hoistModulesInChunk(chunk, compilation, realContainers);
        //     }
        //
        //     debugger;
        //   },
        // );
      },
    );
  }

  private chunkContainsContainerEntryModule(
    chunk: Chunk,
    compilation: Compilation,
  ): boolean {
    for (const module of compilation.chunkGraph.getChunkModulesIterable(
      chunk,
    )) {
      if (module instanceof ContainerEntryModule) {
        this.containerEntryModules.add(module);
        return true;
      }
    }
    return false;
  }

  private clearEntry(
    chunk: Chunk,
    compilation: Compilation,
    realContainers: Map<Chunk['name'], Chunk>,
  ): void {
    const chunkGraph = compilation.chunkGraph;
    const { runtimeChunks } = this.sortNameChunks(chunk, compilation);
    const removedModules = new Set();
    if (
      chunk.name &&
      compilation.entries.has(chunk?.name) &&
      !realContainers.has(chunk.name)
    ) {
      const entrypoint = compilation.entries.get(chunk.name);
      if (!entrypoint) return;
      for (const entryDependency of entrypoint.dependencies) {
        if (!entryDependency) continue;
        const resolvedModule =
          compilation.moduleGraph.getModule(entryDependency);
        if (!resolvedModule) continue;

        const context = resolvedModule.context;
        if (!context) continue;
        if (!context.endsWith('.federation')) continue;
        if (removedModules.has(chunk)) continue;
        chunkGraph.disconnectChunkAndEntryModule(chunk, resolvedModule);
        const getRecursiveConnections = () => {
          const recursiveConnections: Set<Module> = new Set();
          const processModule = (inputModule: Module) => {
            const connections =
              compilation.moduleGraph.getOutgoingConnectionsByModule(
                inputModule,
              );
            if (connections) {
              for (const [module, connection] of connections) {
                if (!module) continue;
                if (recursiveConnections.has(module)) continue;
                recursiveConnections.add(module);
                processModule(module);
              }
            }
          };
          processModule(resolvedModule);
          return recursiveConnections;
        };
        const allAssociatedModules = getRecursiveConnections();

        for (const mod of allAssociatedModules) {
          const roots = Array.from(chunkGraph.getChunkRootModules(chunk));
          debugger;
          if (!chunkGraph.isModuleInChunk(mod, chunk)) continue;
          chunkGraph.disconnectChunkAndModule(chunk, mod);
        }

        allAssociatedModules.add(resolvedModule);

        const runtimes = getRuntime(chunk);
        for (const runtime of runtimes) {
          const runtimeChunk = runtimeChunks.get(runtime);
          if (!runtimeChunk) continue;
          chunkGraph.attachModules(runtimeChunk, allAssociatedModules);
        }

        entrypoint.dependencies.shift();
        removedModules.add(chunk);
      }
    }
  }

  private hoistModulesInChunk(
    chunk: Chunk,
    compilation: Compilation,
    realContainers: Map<Chunk['name'], Chunk>,
  ): void {
    const chunkGraph = compilation.chunkGraph;
    const { runtimeChunks, namedChunks } = this.sortNameChunks(
      chunk,
      compilation,
    );
    const currentChunk = chunk;

    for (const [name, runtime] of runtimeChunks) {
      if (realContainers.has(name)) continue;
      for (const [runtimeName, container] of realContainers) {
        const containerModules = chunkGraph.getChunkModulesIterable(container);
        for (const cm of containerModules) {
          chunkGraph.connectChunkAndModule(runtime, cm);
        }
      }
    }

    debugger;
    for (const [name, entrypoint] of namedChunks) {
      if (realContainers.has(name)) continue;
      for (const [runtimeName, container] of realContainers) {
        const containerModules = chunkGraph.getChunkModulesIterable(container);
        for (const cm of containerModules) {
          // chunkGraph.disconnectChunkAndModule(entrypoint, cm);
        }
      }
    }
  }

  private sortNameChunks(
    chunk: Chunk,
    compilation: Compilation,
  ): {
    runtimeChunks: Map<Chunk['name'], Chunk>;
    namedChunks: Map<Chunk['name'], Chunk>;
  } {
    const runtimeChunks: Map<Chunk['name'], Chunk> = new Map();
    const namedChunks: Map<Chunk['name'], Chunk> = new Map();

    for (const c of compilation.chunks) {
      if (c.hasRuntime() && c.name) {
        runtimeChunks.set(c.name, c);
      } else if (c.name) {
        namedChunks.set(c.name, c);
      }
    }
    return { runtimeChunks, namedChunks };
  }
}

export default HoistContainerReferences;
