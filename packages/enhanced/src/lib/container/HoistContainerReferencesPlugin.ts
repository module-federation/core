import Compiler from 'webpack/lib/Compiler';
import Module from 'webpack/lib/Module';
import Chunk from 'webpack/lib/Chunk';
import Compilation from 'webpack/lib/Compilation';
import ChunkGroup from 'webpack/lib/ChunkGroup';

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
class HoistContainerReferences {
  /**
   * @function apply
   * @param {Compiler} compiler The webpack compiler object
   */
  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'HoistContainerReferences',
      (compilation: Compilation) => {
        compilation.hooks.afterOptimizeChunks.tap(
          'HoistContainerReferences',
          (chunks: Iterable<Chunk>, chunkGroups: ChunkGroup[]) => {
            /** @type {Map<(string|number), Chunk>} */
            const chunkSet = new Map<string | number, Chunk>();
            /** @type {Set<Module>} */
            const externalRequests = new Set<Module>();
            for (const chunk of chunks) {
              const ident = chunk.id || chunk.name;
              if (ident) {
                chunkSet.set(ident, chunk);
              }
            }
            for (const chunk of chunks) {
              const remoteModules =
                compilation.chunkGraph.getChunkModulesIterableBySourceType(
                  chunk,
                  'remote',
                );
              if (!remoteModules) continue;
              for (const remoteModule of remoteModules) {
                remoteModule.dependencies.forEach((dep: any) => {
                  const mod = compilation.moduleGraph.getModule(dep);
                  if (mod !== null && chunk.runtime) {
                    externalRequests.add(mod);
                    const runtimeChunk = (chunk.runtime typeof === 'string' || chunk.runtime typeof === 'number') ? Array.from(chunk.runtime) : [chunk.runtime];
                    runtimeChunk.forEach((runtimeChunkId) => {
                      const runtimeChunk = chunkSet.get(runtimeChunkId);
                      if (runtimeChunk) {
                        compilation.chunkGraph.connectChunkAndModule(
                          runtimeChunk,
                          mod,
                        );
                      }
                    });
                  }
                });
              }
            }
          },
        );
      },
    );
  }
}

export default HoistContainerReferences;
