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
export class HoistContainerReferences {
  /**
   * @function apply
   * @param {Compiler} compiler The webpack compiler object
   */
  apply(compiler: Compiler): void {
    // Hook into the compilation process
    compiler.hooks.thisCompilation.tap(
      'HoistContainerReferences',
      (compilation: Compilation) => {
        // After chunks are optimized, perform the hoisting
        compilation.hooks.afterOptimizeChunks.tap(
          'HoistContainerReferences',
          (chunks: Iterable<Chunk>, chunkGroups: ChunkGroup[]) => {
            // Create a map to store chunks by their id or name
            /** @type {Map<(string|number), Chunk>} */
            const chunkSet = new Map<string | number, Chunk>();
            // Create a set to store external module requests
            /** @type {Set<Module>} */
            const externalRequests = new Set<Module>();
            // Populate the chunkSet with chunks
            for (const chunk of chunks) {
              const ident = chunk.id || chunk.name;
              if (ident) {
                chunkSet.set(ident, chunk);
              }
            }
            // Iterate over chunks again to handle remote modules
            for (const chunk of chunks) {
              // Get iterable of remote modules for the chunk
              const remoteModules =
                compilation.chunkGraph.getChunkModulesIterableBySourceType(
                  chunk,
                  'remote',
                );
              if (!remoteModules) continue;
              // Iterate over remote modules
              for (const remoteModule of remoteModules) {
                // Iterate over dependencies of the remote module
                for (const dep of remoteModule.dependencies) {
                  // Get the module associated with the dependency
                  const mod = compilation.moduleGraph.getModule(dep);
                  // If the module exists and the chunk has a runtime, add the module to externalRequests
                  if (mod !== null && chunk.runtime) {
                    externalRequests.add(mod);
                    // Get the runtime chunk(s) associated with the chunk
                    const runtimeChunk = typeof chunk.runtime === 'string' || typeof chunk.runtime === 'number' ? [chunk.runtime] : [...chunk.runtime];
                    // Iterate over runtime chunks
                    for (const runtimeChunkId of runtimeChunk) {
                      // Get the runtime chunk from the chunkSet
                      const runtimeChunk = chunkSet.get(runtimeChunkId);
                      // If the runtime chunk exists, connect it with the module in the chunk graph
                      if (runtimeChunk) {
                        compilation.chunkGraph.connectChunkAndModule(runtimeChunk, mod);
                      }
                    }
                  }
                }
              }
            }
          },
        );
      },
    );
  }
}
export default HoistContainerReferences;
