/**
 * A webpack plugin that moves specified modules from chunks to runtime chunk.
 * @class AddModulesToRuntimeChunkPlugin
 */
class AddModulesToRuntimeChunkPlugin {
  constructor(options) {
    this.options = { debug: false, ...options };
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

            // Get the delegate module names for remote chunks if specified
            const knownDelegates = remotes
              ? Object.values(remotes).map(
                  (remote) => remote.replace('internal ', '').split('?')[1]
                )
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

            // Iterate over each chunk
            for (const chunk of chunks.filter(
              (chunk) =>
                chunk !== runtimeChunk &&
                applicationName &&
                (chunk.name || chunk.id)?.startsWith(applicationName)
            )) {
              const modulesToMove = [];
              const containers = [];
              const modulesIterable =
                compilation.chunkGraph.getOrderedChunkModulesIterable(chunk);
              const delegateSet = new Set(knownDelegates || []);
              for (const module of modulesIterable) {
                this.classifyModule(module, knownDelegates, internalSharedModules, modulesToMove, containers)
              }

              if (partialContainerModules) {
                for (const module of partialContainerModules) {
                  const destinationArray = module.rawRequest
                    ? modulesToMove
                    : containers;
                  destinationArray.push(module);
                }
              }

              const modulesToConnect = [].concat(modulesToMove, containers)
              const { chunkGraph } = compilation;
              const runtimeChunkModules =
                chunkGraph.getOrderedChunkModulesIterable(runtimeChunk);

              for (const module of modulesToConnect) {
                if (!chunkGraph.isModuleInChunk(module, runtimeChunk)) {
                  chunkGraph.connectChunkAndModule(runtimeChunk, module);
                }

                if (eager && modulesToMove.includes(module)) {
                  if (!isServer && this.options.debug) {
                    console.log(
                      `removing ${module.id || module.identifier()} from ${
                        chunk.name
                      } to ${runtimeChunk.name}`
                    );
                  }
                  chunkGraph.disconnectChunkAndModule(chunk, module);
                }
              }

              for (const module of runtimeChunkModules) {
                if (!chunkGraph.isModuleInChunk(module, chunk)) {
                  const { rawRequest } = module || {};
                  if (delegateSet.has(rawRequest)) {
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
  classifyModule(module, knownDelegates, internalSharedModules, modulesToMove, containers) {
    //todo: this is duplicated from the above function, need to refactor
    const delegateSet = new Set(knownDelegates || []);

    if (delegateSet.has(module?.rawRequest)) {
      containers.push(module);
    } else if (internalSharedModules?.some((share) => module?.rawRequest === share)) {
      modulesToMove.push(module);
    } else if (module?.userRequest?.includes('internal-delegate-hoist')) {
      modulesToMove.push(module);
    }
  }
}

export default AddModulesToRuntimeChunkPlugin;
