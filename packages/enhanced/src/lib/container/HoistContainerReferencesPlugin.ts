import type {
  Compiler,
  Compilation,
  Chunk,
  WebpackPluginInstance,
  Module,
} from 'webpack';
import ContainerEntryModule from './ContainerEntryModule';

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
        compilation.hooks.afterOptimizeChunks.tap(
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
              this.hoistModulesInChunk(chunk, compilation, realContainers);
            }
          },
        );
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
    for (const [name, entry] of compilation.entries) {
      if (realContainers.has(name)) continue;
      for (const entryDependency of entry.dependencies) {
        if (!entryDependency) continue;
        const resolvedModule =
          compilation.moduleGraph.getModule(entryDependency);
        if (!resolvedModule) continue;

        const context = resolvedModule.context;
        if (!context) continue;
        if (!context.endsWith('.federation')) continue;
        if (removedModules.has(chunk)) continue;
        chunkGraph.disconnectChunkAndEntryModule(chunk, resolvedModule);
        entry.dependencies.shift();
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
    for (const [name, entrypoint] of namedChunks) {
      if (realContainers.has(name)) continue;
      for (const [runtimeName, container] of realContainers) {
        const containerModules = chunkGraph.getChunkModulesIterable(container);
        for (const cm of containerModules) {
          chunkGraph.disconnectChunkAndModule(entrypoint, cm);
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
