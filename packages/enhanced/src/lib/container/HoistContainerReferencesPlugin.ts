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

  duplicateChunk(
    chunkA: Chunk,
    chunkB: Chunk,
    compilation: Compilation,
    name: string,
  ): void {
    const { chunkGraph, compiler } = compilation;
    //@ts-ignore
    chunkA.runtime = chunkB.runtime;

    // getChunkModules is used here to create a clone, because disconnectChunkAndModule modifies
    for (const module of chunkGraph.getChunkModules(chunkB)) {
      // dont disconnect as module may need to be copied into multiple chunks
      chunkGraph.connectChunkAndModule(chunkA, module);
    }

    for (const [module, entry] of Array.from(
      chunkGraph.getChunkEntryModulesWithChunkGroupIterable(chunkB),
    )) {
      //@ts-ignore
      chunkGraph.connectChunkAndEntryModule(chunkA, module, entry);
    }

    for (const chunkGroup of chunkB.groupsIterable) {
      // chunkGroup.replaceChunk(chunkB, chunkA);
      chunkA.addGroup(chunkGroup);
      // chunkB.removeGroup(chunkGroup);
    }

    compiler.webpack.ChunkGraph.clearChunkGraphForChunk(chunkB);
  }

  apply(compiler: Compiler): void {
    let hasMultipleRuntime = 0;
    compiler.hooks.make.tapPromise(
      this.constructor.name,
      async (compilation) => {
        let entry: any;
        if (typeof compilation.options.entry === 'function') {
          entry = await compilation.options.entry();
        } else {
          entry = compilation.options.entry;
        }

        Object.keys(entry).forEach((entryItem) => {
          if (entry[entryItem].runtime) {
            hasMultipleRuntime++;
          }
        });
      },
    );
    compiler.hooks.compilation.tap(
      'HoistContainerReferencesPlugin',
      (compilation: Compilation) => {
        const runtimes: Set<string> = new Set();

        compilation.hooks.afterOptimizeChunks.tap(
          {
            name: 'HoistContainerReferencesPlugin',
            stage: 10, // advanced stage chunk optimization
          },
          (chunks: Iterable<Chunk>) => {
            const { chunkGraph } = compilation;
            for (const chunk of chunks) {
              if (!chunk.runtime) continue;
              if (typeof chunk.runtime === 'string') {
                runtimes.add(chunk.runtime);
              } else {
                Array.from(chunk.runtime).forEach((runtime) =>
                  runtimes.add(runtime),
                );
              }
            }

            if (!compiler.options.optimization.runtimeChunk) {
              console.log('#######');
              console.log('#######');
              console.log('#######');
              console.log('#######');
              const federationRuntimeChunk =
                compilation.namedChunks.get('federation-runtime');
              const federationRuntimePlugins = compilation.namedChunks.get(
                'mfp-runtime-plugins',
              );
              if (!federationRuntimeChunk) return;
              // For each chunk that has a runtime, merge the federation-runtime chunk into it
              for (const chunk of chunks) {
                if (chunk.hasRuntime()) {
                  // Do not re-integrate chunks with containers in them. Like remoteEntry - this will destroy entry module
                  if (
                    this.chunkContainsContainerEntryModule(chunk, compilation)
                  )
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

              for (const module of chunkGraph.getChunkModules(
                federationRuntimeChunk,
              )) {
                chunkGraph.disconnectChunkAndModule(
                  federationRuntimeChunk,
                  module,
                );
              }
              if (!federationRuntimePlugins) return;
              for (const module of chunkGraph.getChunkModules(
                federationRuntimePlugins,
              )) {
                chunkGraph.disconnectChunkAndModule(
                  federationRuntimePlugins,
                  module,
                );
              }
              return;
            }

            const runtimeTools = runtime;
            for (const runtime of runtimes) {
              const runtimeChunk = compilation.namedChunks.get(runtime);
              if (!runtimeChunk) continue;
              const baseRuntimeName = 'federation-runtime';
              const basePluginsName = 'mfp-runtime-plugins';
              const newFederationRuntimeChunkName = `${baseRuntimeName}-${runtime}`;
              const newPluginsRuntimeChunkName = `${basePluginsName}-${runtime}`;
              //@ts-ignore
              if (
                this.chunkContainsContainerEntryModule(
                  runtimeChunk,
                  compilation,
                )
              )
                continue;
              const federationRuntimeChunk =
                compilation.namedChunks.get(baseRuntimeName);
              const pluginsRuntimeChunk =
                compilation.namedChunks.get(basePluginsName);
              if (!federationRuntimeChunk || !pluginsRuntimeChunk) continue;
              // Creating a new chunk as a duplicate for federation runtime
              const newFederationRuntimeChunk = compilation.addChunk(
                newFederationRuntimeChunkName,
              );
              // Creating a new chunk as a duplicate for plugins runtime
              const newPluginsRuntimeChunk = compilation.addChunk(
                newPluginsRuntimeChunkName,
              );

              // Set properties from the original federation runtime chunk to the new one
              newFederationRuntimeChunk.filenameTemplate =
                federationRuntimeChunk.filenameTemplate;
              newFederationRuntimeChunk.rendered =
                federationRuntimeChunk.rendered;
              if (newFederationRuntimeChunk.name) {
                // Adding the new federation runtime chunk to the namedChunks collection
                compilation.namedChunks.set(
                  newFederationRuntimeChunk.name,
                  newFederationRuntimeChunk,
                );
              }

              // Set properties from the original plugins runtime chunk to the new one
              newPluginsRuntimeChunk.filenameTemplate =
                pluginsRuntimeChunk.filenameTemplate;
              newPluginsRuntimeChunk.rendered = pluginsRuntimeChunk.rendered;
              if (newPluginsRuntimeChunk.name) {
                // Adding the new plugins runtime chunk to the namedChunks collection
                compilation.namedChunks.set(
                  newPluginsRuntimeChunk.name,
                  newPluginsRuntimeChunk,
                );
              }

              //@ts-ignore

              this.duplicateChunk(
                newFederationRuntimeChunk,
                federationRuntimeChunk,
                compilation,
                //@ts-ignore

                newFederationRuntimeChunk.name,
              );

              this.duplicateChunk(
                newPluginsRuntimeChunk,
                pluginsRuntimeChunk,
                compilation,
                //@ts-ignore

                newPluginsRuntimeChunk.name,
              );
              newFederationRuntimeChunk.runtime = runtime;
              newPluginsRuntimeChunk.runtime = runtime;

              //@ts-ignore
              this.integrateChunks(
                //@ts-ignore
                compilation.namedChunks.get(runtime),
                newFederationRuntimeChunk,
                compilation,
              );
              // //
              this.integrateChunks(
                //@ts-ignore
                compilation.namedChunks.get(runtime),
                newPluginsRuntimeChunk,
                compilation,
              );
              compilation.chunks.delete(newFederationRuntimeChunk);
              compilation.chunks.delete(newPluginsRuntimeChunk);
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
