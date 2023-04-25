/**
 * A webpack plugin that moves specified modules from chunks to runtime chunk.
 * @class AddModulesToRuntimeChunkPlugin
 */
class AddModulesToRuntimeChunkPlugin {
  constructor(options) {
    this.options = { debug: true, ...options };
    this._delegateModules = new Set();
  }

  /**
   * Applies the plugin to the webpack compiler.
   * @param {Object} compiler - The webpack compiler instance.
   */
  apply(compiler) {
    // Check if the target is the server
    const isServer = compiler.options.name === 'server';

    // Tap into compilation hooks
    compiler.hooks.compilation.tap(
      'AddModulesToRuntimeChunkPlugin',
      (compilation) => {
        // Tap into the 'finish-modules' hook to access the module list after they are all processed
        compilation.hooks.finishModules.tapAsync(
          'ModuleIDFinderPlugin',
          (modules, callback) => {
            const {
              runtime,
              container,
              remotes,
              shared,
              eager,
              applicationName,
            } = this.options;

            // Get the delegate module names for remote chunks if specified
            const knownDelegates = new Set(
              remotes
                ? Object.values(remotes).map((remote) =>
                    remote.replace('internal ', '')
                  )
                : []
            );

            for (const module of modules) {
              if (module.resource && knownDelegates.has(module.resource)) {
                this._delegateModules.add(module);
              }
            }
            // Continue the process
            callback();
          }
        );

        // Tap into optimizeChunks hook
        compilation.hooks.optimizeChunks.tap(
          'AddModulesToRuntimeChunkPlugin',
          (chunks) => {
            const {
              runtime,
              container,
              remotes,
              shared,
              eager,
              applicationName,
            } = this.options;

            // Helper function to find a chunk by its name
            const getChunkByName = (name) =>
              chunks.find((chunk) => chunk.name === name);

            // Get the runtime chunk and return if it's not found or has no runtime
            const runtimeChunk = getChunkByName(runtime);
            if (!runtimeChunk || !runtimeChunk.hasRuntime()) return;

            // Get the container chunk if specified
            const partialEntry = container ? getChunkByName(container) : null;

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
              if (isServer) return hasMatch;
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
  classifyModule(module, internalSharedModules, modulesToMove, containers) {
    //TODO: i dont need to classify delegate modules anymore, delete this (and refactor)
    // i added a new hook to resolve config requests to modules in the graph, so i already have the modules as this._delegateModules
    if (this._delegateModules.has(module)) {
      containers.push(module);
    } else if (
      //TODO: do the same for shared modules, resolve them in the afterFinishModules hook
      internalSharedModules?.some((share) =>
        module?.rawRequest?.includes(share)
      )
    ) {
      modulesToMove.push(module);
    } else if (module?.userRequest?.includes('internal-delegate-hoist')) {
      // TODO: can probably move the whole classification part to afterFinishModules,
      //  track all modules i want to move, then just search the chunks
      modulesToMove.push(module);
    }
  }
}

export default AddModulesToRuntimeChunkPlugin;
