import type {
  Compiler,
  Compilation,
  Chunk,
  WebpackPluginInstance,
  ChunkGraph,
} from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import ContainerEntryModule from './ContainerEntryModule';

const runtime = require(
  normalizeWebpackPath('webpack/lib/util/runtime'),
) as typeof import('webpack/lib/util/runtime');
const webpack = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

/**
 * This class is used to hoist container references in the code.
 * @constructor
 */
export class HoistContainerReferences implements WebpackPluginInstance {
  integrateChunks(chunkA: Chunk, chunkB: Chunk, chunkGraph: ChunkGraph): void {
    // Decide for one name (deterministic)
    const RuntimeA =
      typeof chunkA.runtime === 'string' ? [chunkA.runtime] : chunkA.runtime;
    const RuntimeB =
      typeof chunkB.runtime === 'string' ? [chunkB.runtime] : chunkB.runtime;
    let sameRuntime = false;
    if (RuntimeA && RuntimeB) {
      for (const runtimeAElement of RuntimeA) {
        for (const runtimeBElement of RuntimeB) {
          if (runtimeAElement === runtimeBElement) {
            sameRuntime = true;
            break;
          }
        }
      }
    }
    if (!sameRuntime && !chunkA.hasRuntime()) {
      return;
    }

    if (chunkA.name && chunkB.name) {
      if (
        chunkGraph.getNumberOfEntryModules(chunkA) > 0 ===
        chunkGraph.getNumberOfEntryModules(chunkB) > 0
      ) {
        // When both chunks have entry modules or none have one, use
        // shortest name
        if (chunkA.name.length !== chunkB.name.length) {
          chunkA.name =
            chunkA.name.length < chunkB.name.length ? chunkA.name : chunkB.name;
        } else {
          chunkA.name = chunkA.name < chunkB.name ? chunkA.name : chunkB.name;
        }
      } else if (chunkGraph.getNumberOfEntryModules(chunkB) > 0) {
        // Pick the name of the chunk with the entry module
        chunkA.name = chunkB.name;
      }
    } else if (chunkB.name) {
      chunkA.name = chunkB.name;
    }

    // Merge id name hints
    for (const hint of chunkB.idNameHints) {
      chunkA.idNameHints.add(hint);
    }

    // Merge runtime
    //@ts-ignore
    chunkA.runtime = runtime.mergeRuntime(chunkA.runtime, chunkB.runtime);

    // getChunkModules is used here to create a clone, because disconnectChunkAndModule modifies
    for (const module of chunkGraph.getChunkModules(chunkB)) {
      const cb = chunkB;
      const ca = chunkA;

      // chunkGraph.disconnectChunkAndModule(chunkB, module);
      chunkGraph.connectChunkAndModule(chunkA, module);
    }

    for (const [module, chunkGroup] of Array.from(
      chunkGraph.getChunkEntryModulesWithChunkGroupIterable(chunkB),
    )) {
      chunkGraph.disconnectChunkAndEntryModule(chunkB, module);
      // chunkGraph.connectChunkAndEntryModule(chunkA, module, chunkGroup);
    }

    for (const chunkGroup of chunkB.groupsIterable) {
      chunkGroup.replaceChunk(chunkB, chunkA);
      // chunkA.addGroup(chunkGroup);
      chunkB.removeGroup(chunkGroup);
    }
    webpack.ChunkGraph.clearChunkGraphForChunk(chunkB);
    // this.clearChunkGraphForChunk(chunkB);
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      'MergeDuplicateChunksPlugin',
      (compilation: Compilation) => {
        compilation.hooks.optimizeChunks.tap(
          {
            name: 'MergeDuplicateChunksPlugin',
            stage: 10,
          },
          (chunks: Iterable<Chunk>) => {
            const { chunkGraph } = compilation;

            // Identify the federation-runtime chunk
            const federationRuntimeChunk = Array.from(chunks).find(
              (chunk) => chunk.name === 'federation-runtime',
            );
            if (!federationRuntimeChunk) return;
            const runtimeEntryModule =
              chunkGraph.getChunkEntryModulesWithChunkGroupIterable(
                federationRuntimeChunk,
              );

            // For each chunk that has a runtime, merge the federation-runtime chunk into it
            for (const chunk of chunks) {
              if (chunk.hasRuntime() && chunk !== federationRuntimeChunk) {
                // Ensure we can merge the chunks
                // if (chunkGraph.canChunksBeIntegrated(chunk, federationRuntimeChunk)) {
                this.integrateChunks(chunk, federationRuntimeChunk, chunkGraph);
                // Note: Depending on your webpack version and setup, you might need to manually handle the removal of the federation-runtime chunk from the compilation, or adjust how modules/assets are merged.
                // }
              }
            }
          },
        );
      },
    );
    compiler.hooks.thisCompilation.tap(
      'HoistContainerReferences',
      (compilation: Compilation) => {
        compilation.hooks.afterOptimizeChunkModules.tap(
          'HoistContainerReferences',
          (chunks: Iterable<Chunk>) => {
            for (const chunk of chunks) {
              // if (this.chunkContainsContainerEntryModule(chunk, compilation)) {
              // this.hoistModulesInChunk(chunk, compilation);
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

  private hoistModulesInChunk(chunk: Chunk, compilation: Compilation): void {
    const chunkGraph = compilation.chunkGraph;
    const runtimeChunks = this.getRuntimeChunks(chunk, compilation);
    const federationRuntimeChunk =
      compilation.namedChunks.get('federation-runtime');
    if (!federationRuntimeChunk) return;
    // for (const module of chunkGraph.getChunkModulesIterable(federationRuntimeChunk)) {
    for (const runtimeChunk of runtimeChunks) {
      //@ts-ignore
      chunkGraph.attachDependentHashModules(
        runtimeChunk,
        chunkGraph.getChunkModulesIterable(federationRuntimeChunk),
      );
      // chunkGraph.disconnectChunkAndModule(federationRuntimeChunk, module);
    }
    // }
  }

  private getRuntimeChunks(chunk: Chunk, compilation: Compilation): Chunk[] {
    const runtimeChunks = [];
    for (const c of compilation.chunks) {
      if (c.hasRuntime()) {
        runtimeChunks.push(c);
      }
    }
    return runtimeChunks;
  }
}

export default HoistContainerReferences;
