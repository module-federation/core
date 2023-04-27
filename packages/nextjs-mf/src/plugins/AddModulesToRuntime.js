import DelegateModulesPlugin from '@module-federation/utilities/src/plugins/DelegateModulesPlugin';
import { Chunk } from 'webpack';
/**
 * A webpack plugin that moves specified modules from chunks to runtime chunk.
 * @class AddModulesToRuntimeChunkPlugin
 */
class AddModulesToRuntimeChunkPlugin {
  constructor(options) {
    this.options = { debug: false, ...options };
    this._delegateModules = new Set();
    this._eagerModules = new Set();
  }

  getChunkByName(chunks, name) {
    for (const chunk of chunks) {
      if (chunk.name == name) {
        return chunk;
      }
    }
    return undefined;
  }

  resolveSharedModules(compilation) {
    // Tap into the 'finish-modules' hook to access the module list after they are all processed
    compilation.hooks.finishModules.tapAsync(
      'AddModulesToRuntimeChunkPlugin',
      (modules, callback) => {
        const { shared } = this.options;

        if (shared) {
          const shareKey = Object.keys(shared);

          for (const module of modules) {
            if (
              shareKey.some((share) => {
                if (module?.rawRequest === share) {
                  return true;
                } else if (share.endsWith('/')) {
                  return module?.rawRequest?.startsWith(share);
                } else {
                  return false;
                }
              })
            ) {
              this._sharedModules.add(module);
            }
          }
        }
        callback();
      }
    );
  }

  /**
   * Applies the plugin to the webpack compiler.
   * @param {Object} compiler - The webpack compiler instance.
   */
  apply(compiler) {
    // Check if the target is the server
    const isServer = compiler.options.name === 'server';
    const { runtime, container, remotes, shared, eager, applicationName } =
      this.options;

    new DelegateModulesPlugin({
      runtime,
      container,
      remotes,
    }).apply(compiler);

    if (!isServer) {
      // next-client-pages-loade
    }
    //TODO: investigate further and see if this can be used to add async boundries

    // if (
    //   compiler.options.mode === 'development' &&
    //   typeof compiler.options.entry === 'function' &&
    //   !isServer
    // ) {
    // const backupEntries = compiler.options.entry;
    // compiler.options.entry = () =>
    //   backupEntries().then((entries) => {
    //     //loop over object with for
    //     if (entries) {
    //       for (const [key, value] of Object.entries(entries)) {
    //         if (key === 'main') {
    //           value.import[0] =
    //             require.resolve('./async-pages-loader') +
    //             '!' +
    //             value.import[0];
    //         }
    //         if (key === 'pages/_app') {
    //           value.import[1] =
    //             require.resolve('./async-pages-loader') +
    //             '!' +
    //             value.import[1];
    //         }
    //         if (value.import[0].startsWith('next-client-pages-loader')) {
    //           value.import[0] =
    //             require.resolve('./async-pages-loader') +
    //             '!' +
    //             value.import[0];
    //         }
    //       }
    //     }
    //     return entries;
    //   });
    // }

    // Tap into compilation hooks
    compiler.hooks.compilation.tap(
      'AddModulesToRuntimeChunkPlugin',
      (compilation) => {
        // Tap into optimizeChunks hook
        compilation.hooks.optimizeChunks.tap(
          'AddModulesToRuntimeChunkPlugin',
          (chunks) => {
            console.log('running optimize chunks action');
            // Get the runtime chunk and return if it's not found or has no runtime
            const mainChunk = this.getChunkByName(chunks, 'main');
            const runtimeChunk = this.getChunkByName(chunks, 'webpack');
            const container = this.getChunkByName(
              chunks,
              this.options.container
            );

            if (container && !isServer) {
              compilation.chunkGraph
                .getChunkModulesIterable(container)
                .forEach((module) => {
                  if (
                    // module.type === 'provide-module' ||
                    module.type === 'javascript/auto'
                  ) {
                    compilation.chunkGraph.disconnectChunkAndModule(
                      container,
                      module
                    );
                    return;
                  }

                  // console.log(module.identifier(), module.type);
                });
            }

            for (const chunk of chunks) {
              if (!isServer) {
                for (const module of chunk.modulesIterable) {
                  if (
                    module.identifier().includes('webpack/runtime') ||
                    module.identifier().includes('webpack/runtime')
                    // chunk.debugId !== runtimeChunk.debugId
                  ) {
                    console.log(
                      'already in runtime',
                      module.identifier(),
                      chunk.debugId,
                      runtimeChunk.debugId
                    );

                    // compilation.chunkGraph.disconnectChunkAndModule(
                    //   chunk,
                    //   module
                    // );
                  }
                }
              }
            }

            return;

            if (!runtimeChunk || !runtimeChunk.hasRuntime()) return;
            return;
            // Get the container chunk if specified
            const partialEntry = container
              ? this.getChunkByName(chunks, container)
              : null;

            // Get the shared module names to their imports if specified
            const internalSharedModules = shared
              ? Object.entries(shared).map(
                  ([key, value]) => value.import || key
                )
              : null;

            // Get the modules of the container chunk if specified
            const partialContainerModules = partialEntry
              ? compilation.chunkGraph.getOrderedChunkModulesIterable(
                  partialEntry
                )
              : null;

            const foundChunks = chunks.filter((chunk) => {
              const hasMatch = chunk !== runtimeChunk;
              return (
                hasMatch &&
                applicationName &&
                (chunk.name || chunk.id)?.startsWith(applicationName)
              );
            });

            // Iterate over each chunk
            for (const chunk of foundChunks) {
              const modulesToMove = [];
              const containers = [];
              const modulesIterable =
                compilation.chunkGraph.getOrderedChunkModulesIterable(chunk);
              for (const module of modulesIterable) {
                this.classifyModule(
                  module,
                  internalSharedModules,
                  modulesToMove,
                  containers
                );
              }

              if (partialContainerModules) {
                for (const module of partialContainerModules) {
                  const destinationArray = module.rawRequest
                    ? modulesToMove
                    : containers;
                  destinationArray.push(module);
                }
              }

              const modulesToConnect = [].concat(modulesToMove, containers);

              const { chunkGraph } = compilation;
              const runtimeChunkModules =
                chunkGraph.getOrderedChunkModulesIterable(runtimeChunk);

              for (const module of modulesToConnect) {
                if (!chunkGraph.isModuleInChunk(module, runtimeChunk)) {
                  chunkGraph.connectChunkAndModule(runtimeChunk, module);
                }

                if (eager && modulesToMove.includes(module)) {
                  if (this.options.debug) {
                    console.log(
                      `removing ${module.id || module.identifier()} from ${
                        chunk.name || chunk.id
                      } to ${runtimeChunk.name}`
                    );
                  }
                  chunkGraph.disconnectChunkAndModule(chunk, module);
                }
              }

              for (const module of runtimeChunkModules) {
                if (!chunkGraph.isModuleInChunk(module, chunk)) {
                  if (this._delegateModules.has(module)) {
                    chunkGraph.connectChunkAndModule(chunk, module);
                    if (this.options.debug) {
                      console.log(
                        `adding ${module.rawRequest} to ${chunk.name} from ${runtimeChunk.name} not removing it`
                      );
                    }
                  }
                }
              }
            }
          }
        );
      }
    );
  }
  classifyModule(module, internalSharedModules, modulesToMove) {
    if (
      //TODO: do the same for shared modules, resolve them in the afterFinishModules hook
      internalSharedModules?.some((share) =>
        module?.rawRequest?.includes(share)
      )
    ) {
      // modulesToMove.push(module);
    } else if (module?.userRequest?.includes('internal-delegate-hoist')) {
      // TODO: can probably move the whole classification part to afterFinishModules,
      //  track all modules i want to move, then just search the chunks
      // modulesToMove.push(module);
    }
  }
}

export default AddModulesToRuntimeChunkPlugin;
