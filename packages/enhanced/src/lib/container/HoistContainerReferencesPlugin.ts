import type {
  Compiler,
  Compilation,
  Chunk,
  WebpackPluginInstance,
  ExternalModule,
} from 'webpack';
import ContainerEntryModule from './ContainerEntryModule';

/**
 * This class is used to hoist container references in the code.
 * @constructor
 */
export class HoistContainerReferences implements WebpackPluginInstance {
  private containerName?: string | undefined;

  constructor(name: any) {
    this.containerName = name || 'no known chunk name';
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'HoistContainerReferences',
      (compilation: Compilation) => {
        compilation.hooks.afterOptimizeChunks.tap(
          'HoistContainerReferences',
          (chunks: Iterable<Chunk>) => {
            const runtimeChunks = this.getRuntimeChunks(compilation);
            for (const chunk of chunks) {
              // if (this.chunkContainsContainerEntryModule(chunk, compilation)) {
              this.hoistModulesInChunk(chunk, compilation, runtimeChunks);
              // }
            }
          },
        );
      },
    );
  }

  private chunkContainsContainerEntryModule(
    chunk: Chunk,
    compilation: Compilation,
    runtimeChunks: Set<Chunk>,
  ): boolean {
    for (const module of compilation.chunkGraph.getChunkModulesIterable(
      chunk,
    )) {
      if (module instanceof ContainerEntryModule) {
        return true;
      }
    }
    return false;
  }

  private hoistModulesInChunk(
    chunk: Chunk,
    compilation: Compilation,
    runtimeChunks: Set<Chunk>,
  ): void {
    const { chunkGraph, moduleGraph } = compilation;
    const remoteModules = chunkGraph.getChunkModulesIterableBySourceType(
      chunk,
      'remote',
    );
    if (remoteModules) {
      for (const module of remoteModules) {
        const external = module.dependencies[0];
        const externalModule = moduleGraph.getModule(external);

        if (chunk.hasRuntime() || !externalModule) {
          continue;
        }

        for (const runtimeChunk of runtimeChunks) {
          if (chunkGraph.isModuleInChunk(externalModule, runtimeChunk))
            continue;
          chunkGraph.connectChunkAndModule(runtimeChunk, externalModule);
        }
      }
    }
    if (chunk.name === this.containerName) {
      for (const module of chunkGraph.getChunkRootModules(chunk)) {
        chunkGraph.disconnectChunkAndModule(chunk, module);
        for (const runtimeChunk of runtimeChunks) {
          // if (chunkGraph.isModuleInChunk(module, runtimeChunk)) continue;
          chunkGraph.connectChunkAndModule(runtimeChunk, module);
        }
      }
    }
  }

  private getRuntimeChunks(compilation: Compilation): Set<Chunk> {
    const runtimeChunks = new Set<Chunk>();
    for (const c of compilation.chunks) {
      if (c.hasRuntime()) {
        runtimeChunks.add(c);
      }
    }
    return runtimeChunks;
  }
}

export default HoistContainerReferences;
