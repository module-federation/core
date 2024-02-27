import type {
  Compiler,
  Compilation,
  Chunk,
  WebpackPluginInstance,
} from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import ContainerEntryModule from './ContainerEntryModule';

const runtime = require(
  normalizeWebpackPath('webpack/lib/util/runtime'),
) as typeof import('webpack/lib/util/runtime');

/**
 * This class is used to hoist container references in the code.
 * @constructor
 */
export class HoistContainerReferencesPlugin implements WebpackPluginInstance {
  integrateChunks(
    chunkA: Chunk,
    chunkB: Chunk,
    compilation: Compilation,
  ): void {
    const { chunkGraph, compiler } = compilation;
    // do not sort chunk by smallest name, this will cause non-deterministic chunk integration

    // if (chunkA.name && chunkB.name) {
    //   if (
    //     chunkGraph.getNumberOfEntryModules(chunkA) > 0 ===
    //     chunkGraph.getNumberOfEntryModules(chunkB) > 0
    //   ) {
    //     // When both chunks have entry modules or none have one, use
    //     // shortest name
    //     if (chunkA.name.length !== chunkB.name.length) {
    //       chunkA.name =
    //         chunkA.name.length < chunkB.name.length ? chunkA.name : chunkB.name;
    //     } else {
    //       chunkA.name = chunkA.name < chunkB.name ? chunkA.name : chunkB.name;
    //     }
    //   } else if (chunkGraph.getNumberOfEntryModules(chunkB) > 0) {
    //     // Pick the name of the chunk with the entry module
    //     chunkA.name = chunkB.name;
    //   }
    // } else if (chunkB.name) {
    //   chunkA.name = chunkB.name;
    // }
    //
    // // Merge id name hints
    for (const hint of chunkB.idNameHints) {
      chunkA.idNameHints.add(hint);
    }

    // Merge runtime
    //@ts-ignore
    chunkA.runtime = runtime.mergeRuntime(chunkA.runtime, chunkB.runtime);

    // getChunkModules is used here to create a clone, because disconnectChunkAndModule modifies
    for (const module of chunkGraph.getChunkModules(chunkB)) {
      // dont disconnect as module may need to be copied into multiple chunks
      // chunkGraph.disconnectChunkAndModule(chunkB, module);
      chunkGraph.connectChunkAndModule(chunkA, module);
    }

    for (const [module, chunkGroup] of Array.from(
      chunkGraph.getChunkEntryModulesWithChunkGroupIterable(chunkB),
    )) {
      // dont disconnect as module may need to be copied into multiple chunks
      // chunkGraph.disconnectChunkAndEntryModule(chunkB, module);
      //connect as normal module not entry module to preserve existing entrypoint modules
      chunkGraph.connectChunkAndModule(chunkA, module);
      // chunkGraph.connectChunkAndEntryModule(chunkA, module,chunkGroup);
    }

    for (const chunkGroup of chunkB.groupsIterable) {
      chunkGroup.replaceChunk(chunkB, chunkA);
      chunkA.addGroup(chunkGroup);
      chunkB.removeGroup(chunkGroup);
    }
    compiler.webpack.ChunkGraph.clearChunkGraphForChunk(chunkB);
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      'HoistContainerReferencesPlugin',
      (compilation: Compilation) => {
        compilation.hooks.afterOptimizeChunks.tap(
          {
            name: 'HoistContainerReferencesPlugin',
            stage: 10, // advanced stage chunk optimization
          },
          (chunks: Iterable<Chunk>) => {
            const { chunkGraph } = compilation;
            const federationRuntimeChunk =
              compilation.namedChunks.get('federation-runtime');
            const federationRuntimePlugins = compilation.namedChunks.get(
              'mfp-runtime-plugins',
            );
            if (!federationRuntimeChunk) return;
            // For each chunk that has a runtime, merge the federation-runtime chunk into it
            for (const chunk of chunks) {
              if (
                chunk.hasRuntime() &&
                chunk !== federationRuntimeChunk &&
                chunk !== federationRuntimePlugins
              ) {
                // Do not re-integrate chunks with containers in them. Like remoteEntry - this will destroy entry module
                if (this.chunkContainsContainerEntryModule(chunk, compilation))
                  continue;
                this.integrateChunks(
                  chunk,
                  federationRuntimeChunk,
                  compilation,
                );
                if (
                  federationRuntimePlugins &&
                  chunk !== federationRuntimePlugins
                ) {
                  this.integrateChunks(
                    chunk,
                    federationRuntimePlugins,
                    compilation,
                  );
                }
              }
            }
          },
        );

        compilation.hooks.beforeChunkAssets.tap(
          'HoistContainerReferencesPlugin',
          () => {
            // the federation-runtime chunk is integrated into multiple other runtime chunks, like main, or runtime.js
            // because this entrypoint is integrated using chunk group updates - this chunk cannot be emitted without causing multiple writes to same runtime
            // the federation-runtime serves no output process, it is used as a reference to hoist federation runtime once into all runtime chunks for eager consumption
            // this plugin serves
            const federationRuntimeChunk =
              compilation.namedChunks.get('federation-runtime');

            const federationRuntimePluginsChunk = compilation.namedChunks.get(
              'mfp-runtime-plugins',
            );
            if (federationRuntimeChunk)
              compilation.chunks.delete(federationRuntimeChunk);

            if (federationRuntimePluginsChunk)
              compilation.chunks.delete(federationRuntimePluginsChunk);
          },
        );
      },
    );
  }

  private chunkContainsContainerEntryModule(
    chunk: Chunk,
    compilation: Compilation,
  ): boolean {
    let hasContainerEntryModule = false;
    for (const module of compilation.chunkGraph.getChunkModulesIterable(
      chunk,
    )) {
      if (module instanceof ContainerEntryModule) {
        hasContainerEntryModule = true;
        break;
      }
    }
    return hasContainerEntryModule;
  }
}

export default HoistContainerReferencesPlugin;
