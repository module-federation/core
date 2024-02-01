/*
    MIT License http://www.opensource.org/licenses/mit-license.php
    Author Tobias Koppers @sokra
*/

import type { Compiler, Compilation, Chunk } from 'webpack'; // Assuming these types are defined in your project
/**
 * @param {RuntimeSpec} a first
 * @param {RuntimeSpec} b second
 * @returns {boolean} true, when they are equal
 */
//@ts-ignore
const runtimeEqual = (a, b) => {
  if (a === b) {
    return true;
  } else if (
    a === undefined ||
    b === undefined ||
    typeof a === 'string' ||
    typeof b === 'string'
  ) {
    return false;
  } else if (a.size !== b.size) {
    return false;
  } else {
    a.sort();
    b.sort();
    const aIt = a[Symbol.iterator]();
    const bIt = b[Symbol.iterator]();
    for (;;) {
      const aV = aIt.next();
      if (aV.done) return true;
      const bV = bIt.next();
      if (aV.value !== bV.value) return false;
    }
  }
};
class MergeDuplicateChunksPlugin {
  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      'MergeDuplicateChunksPlugin',
      (compilation: Compilation) => {
        compilation.hooks.optimizeChunks.tap(
          {
            name: 'MergeDuplicateChunksPlugin',
            stage: -10,
          },
          (chunks: Iterable<Chunk>) => {
            const { chunkGraph, moduleGraph } = compilation;

            // remember already tested chunks for performance
            const notDuplicates = new Set<Chunk>();

            // for each chunk
            for (const chunk of chunks) {
              // track a Set of all chunk that could be duplicates
              let possibleDuplicates: Set<Chunk> | undefined;
              for (const module of chunkGraph.getChunkModulesIterable(chunk)) {
                if (possibleDuplicates === undefined) {
                  // when possibleDuplicates is not yet set,
                  // create a new Set from chunks of the current module
                  // including only chunks with the same number of modules
                  for (const dup of chunkGraph.getModuleChunksIterable(
                    module,
                  )) {
                    if (
                      dup !== chunk &&
                      chunkGraph.getNumberOfChunkModules(chunk) ===
                        chunkGraph.getNumberOfChunkModules(dup) &&
                      !notDuplicates.has(dup)
                    ) {
                      // delay allocating the new Set until here, reduce memory pressure
                      possibleDuplicates =
                        possibleDuplicates ?? new Set<Chunk>();
                      possibleDuplicates.add(dup);
                    }
                  }
                  // when no chunk is possible we can break here
                  if (possibleDuplicates === undefined) break;
                } else {
                  // validate existing possible duplicates
                  for (const dup of possibleDuplicates) {
                    // remove possible duplicate when module is not contained
                    if (!chunkGraph.isModuleInChunk(module, dup)) {
                      possibleDuplicates.delete(dup);
                    }
                  }
                  // when all chunks has been removed we can break here
                  if (possibleDuplicates.size === 0) break;
                }
              }

              // when we found duplicates
              if (
                possibleDuplicates !== undefined &&
                possibleDuplicates.size > 0
              ) {
                outer: for (const otherChunk of possibleDuplicates) {
                  if (otherChunk.hasRuntime() !== chunk.hasRuntime()) continue;
                  if (chunkGraph.getNumberOfEntryModules(chunk) > 0) continue;
                  if (chunkGraph.getNumberOfEntryModules(otherChunk) > 0)
                    continue;
                  if (!runtimeEqual(chunk.runtime, otherChunk.runtime)) {
                    for (const module of chunkGraph.getChunkModulesIterable(
                      chunk,
                    )) {
                      const exportsInfo = moduleGraph.getExportsInfo(module);
                      if (
                        !exportsInfo.isEquallyUsed(
                          chunk.runtime,
                          otherChunk.runtime,
                        )
                      ) {
                        continue outer;
                      }
                    }
                  }
                  // merge them
                  if (chunkGraph.canChunksBeIntegrated(chunk, otherChunk)) {
                    chunkGraph.integrateChunks(chunk, otherChunk);
                    compilation.chunks.delete(otherChunk);
                  }
                }
              }

              // don't check already processed chunks twice
              notDuplicates.add(chunk);
            }
          },
        );
      },
    );
  }
}

export = MergeDuplicateChunksPlugin;
