import { Compiler, Chunk, Module, Compilation, ChunkGroup } from 'webpack';

/**
 * @typedef {import("webpack").Compiler} Compiler
 * @typedef {import("webpack").Compilation} Compilation
 * @typedef {import("webpack").Chunk} Chunk
 * @typedef {import("webpack").Module} Module
 */

/**
 * This class is responsible for hoisting container references in the code.
 * @constructor
 */
export class HoistPseudoEager {
  /**
   * @function apply
   * @param {Compiler} compiler The webpack compiler object
   */
  apply(compiler: Compiler): void {
    // Hook into the compilation process
    compiler.hooks.thisCompilation.tap(
      'HoistPseudoEager',
      (compilation: Compilation) => {
        // Perform the hoisting after chunks are optimized
        compilation.hooks.afterOptimizeChunks.tap(
          'HoistPseudoEager',
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
              const runtime =
                chunkSet.get('webpack-runtime') || chunkSet.get('webpack');
              const runtimeRoots = runtime
                ? compilation.chunkGraph.getChunkRootModules(runtime)
                : null;
              const refChunks = runtime
                ? Array.from(runtime.getAllReferencedChunks())
                : null;
              if (refChunks) {
                for (const refChunk of refChunks) {
                  const consumeSharedModules =
                    compilation.chunkGraph.getChunkModulesIterableBySourceType(
                      refChunk,
                      'consume-shared',
                    );
                  if (!consumeSharedModules) continue;
                  //loop through consume-shared modules
                  for (const module of consumeSharedModules) {
                    // Get the module associated with the dependency
                    for (const block of module.blocks) {
                      for (const dep of block.dependencies) {
                        const mod = compilation.moduleGraph.getModule(dep);
                        // If the module exists and the chunk has a runtime, add the module to externalRequests
                        if (mod !== null && runtime) {
                          // Get the runtime chunk from the chunkSet
                          // If the runtime chunk exists, connect it with the module in the chunk graph
                          compilation.chunkGraph.connectChunkAndModule(
                            runtime,
                            mod,
                          );
                        }
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
export default HoistPseudoEager;
