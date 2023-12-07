import {
  Compiler,
  Module,
  Chunk,
  Compilation,
  ChunkGroup,
  WebpackPluginInstance,
} from 'webpack';

/**
 * @typedef {import("webpack").Compiler} Compiler
 * @typedef {import("webpack").Compilation} Compilation
 * @typedef {import("webpack").Chunk} Chunk
 * @typedef {import("webpack").Module} Module
 */

/**
 * This class is used to hoist container references in the code.
 * @constructor
 */
export class HoistContainerReferences implements WebpackPluginInstance {
  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'HoistContainerReferences',
      (compilation: Compilation) => {
        compilation.hooks.afterOptimizeChunks.tap(
          'HoistContainerReferences',
          (chunks: Iterable<Chunk>, chunkGroups: ChunkGroup[]) => {
            const chunkSet = this.createChunkSet(chunks);
            const externalRequests = new Set<Module>();

            for (const chunk of chunks) {
              this.handleRemoteModules(
                chunk,
                chunkSet,
                externalRequests,
                compilation,
              );
            }
          },
        );
      },
    );
  }

  private createChunkSet(chunks: Iterable<Chunk>): Map<string | number, Chunk> {
    const chunkSet = new Map<string | number, Chunk>();
    for (const chunk of chunks) {
      const ident = chunk.id || chunk.name;
      if (ident) {
        chunkSet.set(ident, chunk);
      }
    }
    return chunkSet;
  }

  private handleRemoteModules(
    chunk: Chunk,
    chunkSet: Map<string | number, Chunk>,
    externalRequests: Set<Module>,
    compilation: Compilation,
  ): void {
    const remoteModules =
      compilation.chunkGraph.getChunkModulesIterableBySourceType(
        chunk,
        'remote',
      );
    if (!remoteModules) return;

    for (const remoteModule of remoteModules) {
      for (const dep of remoteModule.dependencies) {
        const mod = compilation.moduleGraph.getModule(dep);
        if (mod !== null && chunk.runtime) {
          externalRequests.add(mod);
          this.connectModulesWithRuntimeChunk(
            chunk,
            mod,
            chunkSet,
            compilation,
          );
        }
      }
    }
  }

  private connectModulesWithRuntimeChunk(
    chunk: Chunk,
    mod: Module,
    chunkSet: Map<string | number, Chunk>,
    compilation: Compilation,
  ): void {
    const runtimeChunkIds =
      typeof chunk.runtime === 'string' || typeof chunk.runtime === 'number'
        ? [chunk.runtime]
        //@ts-ignore
        : [...chunk.runtime];
    const containers = this.getContainers(runtimeChunkIds, chunkSet);

    for (const runtimeChunkId of runtimeChunkIds) {
      const runtimeChunk = chunkSet.get(runtimeChunkId);
      if (runtimeChunk) {
        this.connectContainerModulesWithRuntimeChunk(
          runtimeChunk,
          containers,
          compilation,
        );
        compilation.chunkGraph.connectChunkAndModule(runtimeChunk, mod);
      }
    }
  }

  private getContainers(
    runtimeChunkIds: (string | number)[],
    chunkSet: Map<string | number, Chunk>,
  ): Chunk[] {
    const containers: Chunk[] = [];
    for (const runtimeChunkId of runtimeChunkIds) {
      const runtimeChunk = chunkSet.get(runtimeChunkId);
      const entryModule = runtimeChunk?.entryModule;
      if (
        entryModule &&
        entryModule.identifier().startsWith('container entry')
      ) {
        containers.push(runtimeChunk);
      }
    }
    return containers;
  }

  private connectContainerModulesWithRuntimeChunk(
    runtimeChunk: Chunk,
    containers: Chunk[],
    compilation: Compilation,
  ): void {
    for (const container of containers) {
      const roots = container.getModules();
      for (const root of roots) {
        compilation.chunkGraph.connectChunkAndModule(runtimeChunk, root);
      }
    }
  }
}
export default HoistContainerReferences;
