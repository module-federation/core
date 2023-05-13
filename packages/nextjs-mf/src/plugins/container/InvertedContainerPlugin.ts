import type { Chunk, Compilation, Compiler, Module } from 'webpack';
import { RawSource } from 'webpack-sources';
//@ts-ignore
import type { ModuleFederationPluginOptions } from '../types';
import InvertedContainerRuntimeModule from './InvertedContainerRuntimeModule';
import { RuntimeGlobals } from 'webpack';
import Template from '../../../utils/Template';
/**
 * Interface for InvertedContainerOptions, extending ModuleFederationPluginOptions.
 * This interface includes additional fields specific to the plugin's behavior.
 */
interface InvertedContainerOptions extends ModuleFederationPluginOptions {
  container?: string;
  remotes: Record<string, string>; // A map of remote modules to their URLs.
  runtime: string; // The name of the current module.
  debug?: boolean; // A flag to enable debug logging.
}

/**
 * InvertedContainerPlugin is a Webpack plugin that handles loading of chunks in a federated module.
 * It sets up runtime modules for each chunk, ensuring the proper loading of remote modules.
 */
class InvertedContainerPlugin {
  private options: InvertedContainerOptions;

  /**
   * Constructor for the InvertedContainerPlugin.
   * @param {InvertedContainerOptions} options - Plugin configuration options.
   */
  constructor(options: {
    container: string | undefined;
    runtime: string;
    remotes: Record<string, string>;
    debug: boolean;
  }) {
    this.options = options || ({} as InvertedContainerOptions);
  }

  resolveContainerModule(compilation: Compilation) {
    if (!this.options.container) {
      return undefined;
    }
    const container = compilation.entrypoints
      .get(this.options.container as string)
      ?.getRuntimeChunk?.();
    const entryModule = container?.entryModule;
    return entryModule;
  }

  /**
   * Apply method for the Webpack plugin, handling the plugin logic and hooks.
   * @param {Compiler} compiler - Webpack compiler instance.
   */
  apply(compiler: Compiler) {
    // Hook into the compilation process.
    compiler.hooks.thisCompilation.tap(
      'InvertedContainerPlugin',
      (compilation) => {
        // Create a WeakSet to store chunks that have already been processed.
        const onceForChunkSet = new WeakSet();

        // Define a handler function to be called for each chunk in the compilation.
        const handler = (chunk: Chunk, set: Set<string>) => {
          // If the chunk has already been processed, skip it.
          if (onceForChunkSet.has(chunk)) return;
          set.add(RuntimeGlobals.onChunksLoaded);
          // set.add(RuntimeGlobals.startupOnlyAfter);

          // Mark the chunk as processed by adding it to the WeakSet.
          onceForChunkSet.add(chunk);

          if (chunk.hasRuntime()) {
            // Add an InvertedContainerRuntimeModule to the chunk, which handles
            // the runtime logic for loading remote modules.
            compilation.addRuntimeModule(
              chunk,
              new InvertedContainerRuntimeModule(set, this.options, {
                webpack: compiler.webpack,
                debug: this.options.debug,
              })
            );
          }
        };

        compilation.hooks.additionalChunkRuntimeRequirements.tap(
          'InvertedContainerPlugin',
          handler
        );

        if (this.options.debug) {
          compilation.hooks.afterOptimizeChunkModules.tap(
            'InvertedContainerPlugin',
            (chunks, modules) => {
              for (const chunk of chunks) {
                if (
                  chunk.hasRuntime() &&
                  chunk.name === this.options?.container
                ) {
                  const getmodules = chunk.getModules();

                  console.log(getmodules.length, chunk.name);
                }
              }
            }
          );
        }

        compilation.hooks.optimizeChunkModules.tap(
          'InvertedContainerPlugin',
          (chunks, modules) => {
            // Create a Set to store dependent modules
            const dependentModules: Set<Module> = new Set();

            // Create a Set to track visited modules during traversal
            const visitedModules: Set<Module> = new Set();

            // Function to traverse the module graph recursively
            function traverseModuleGraph(module: Module) {
              // Check if module has been visited before
              if (visitedModules.has(module)) {
                return; // Skip traversal if module has been visited
              }

              visitedModules.add(module); // Mark module as visited

              // Skip traversal for certain module types
              if (
                module.type === 'provide-module' ||
                module.type === 'consume-shared-module'
              ) {
                return;
              }

              dependentModules.add(module); // Add module to dependent modules set

              module.dependencies.forEach((dependency) => {
                // Get the dependent module using moduleGraph
                const dependentModule =
                  compilation.moduleGraph.getModule(dependency);

                // If dependent module exists and is not already in dependentModules set, traverse it
                if (dependentModule && !dependentModules.has(dependentModule)) {
                  traverseModuleGraph(dependentModule);
                }
              });
            }

            // Iterate over chunks and modules
            for (const chunk of chunks) {
              // Check if the chunk has a runtime and matches the specified container name
              if (
                chunk.hasRuntime() &&
                chunk.name === this.options?.container
              ) {
                // get all provide-shared modules
                const eagerModulesInRemote =
                  compilation.chunkGraph.getChunkModulesIterableBySourceType(
                    chunk,
                    'share-init'
                  ) || [];

                // Loop through modules in the chunk
                for (const module of eagerModulesInRemote) {
                  // If the module is eager, add it to eagerModulesInRemote set
                  //@ts-ignore
                  if (module._eager) {
                    //@ts-ignore
                    eagerModulesInRemote.add(module._request);
                  }

                  // If the module is eager or has a name starting with 'next', disconnect it from the chunk
                  //@ts-ignore
                  if (module?._eager || module?._name?.startsWith('next')) {
                    compilation.chunkGraph.disconnectChunkAndModule(
                      chunk,
                      module
                    );
                  }
                }

                // Loop through modules again
                for (const module of modules) {
                  // Skip module if it is not in the chunk
                  if (!compilation.chunkGraph.isModuleInChunk(module, chunk)) {
                    continue;
                  }

                  // Process module if it is a NormalModule and its resource is in eagerModulesInRemote set
                  if (module.constructor.name === 'NormalModule') {
                    //@ts-ignore
                    if (eagerModulesInRemote.has(module.resource)) {
                      // Traverse the module graph recursively
                      traverseModuleGraph(module);
                    }
                  }
                }

                // Loop through dependentModules set and disconnect them from the chunk
                for (const moduleToRemove of dependentModules) {
                  if (this.options.debug) {
                    //@ts-ignore
                    console.log('removing', moduleToRemove?.resource);
                  }

                  if (
                    compilation.chunkGraph.isModuleInChunk(
                      moduleToRemove,
                      chunk
                    )
                  ) {
                    compilation.chunkGraph.disconnectChunkAndModule(
                      chunk,
                      moduleToRemove
                    );
                  }
                }
              }
            }
          }
        );

        compilation.hooks.optimizeChunks.tap(
          'InvertedContainerPlugin',
          (chunks) => {
            const containerEntryModule =
              this.resolveContainerModule(compilation);
            if (!containerEntryModule) return;
            for (const chunk of chunks) {
              if (
                chunk.hasRuntime() &&
                chunk.name === this.options?.container
              ) {
                const modules = chunk.getModules();
                for (const module of modules) {
                  if (module.constructor.name === 'NormalModule') {
                    // compilation.chunkGraph.disconnectChunkAndModule(
                    //   chunk,
                    //   module
                    // );
                  }
                }
              }

              if (
                !compilation.chunkGraph.isModuleInChunk(
                  containerEntryModule,
                  chunk
                )
              ) {
                compilation.chunkGraph.connectChunkAndModule(
                  chunk,
                  containerEntryModule
                );
              }
            }
          }
        );

        const hooks =
          compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
            compilation
          );

        compilation.hooks.afterOptimizeChunkAssets.tap(
          'InvertedContainerPlugin',
          (chunks) => {
            chunks.forEach((chunk) => {
              const chunkModules =
                compilation.chunkGraph.getChunkRuntimeModulesIterable(chunk);
              const runtimeRequirementsInChunk =
                compilation.chunkGraph.getChunkRuntimeRequirements(chunk);

              chunk.files.forEach((file) => {
                const asset = compilation.getAsset(file);
                if (asset) {
                  let source = asset.source.source();

                  // Inject the chunk name at the beginning of the file
                  source = source
                    .toString()
                    //@ts-ignore
                    .replace('__INSERT_CH_ID__MF__', chunk.id);
                  const sourceBuffer = Buffer.from(source, 'utf-8');
                  const sourceObj = {
                    source: () => sourceBuffer,
                    size: () => sourceBuffer.length,
                  };
                  //@ts-ignore
                  compilation.updateAsset(file, sourceObj);
                }
              });
            });
          }
        );

        hooks.renderStartup.tap(
          'InvertedContainerPlugin',
          //@ts-ignore
          (source, renderContext) => {
            if (
              renderContext &&
              renderContext.constructor.name !== 'NormalModule'
            ) {
              return source;
            }

            const newSource = [];
            const replaceSource = source.source().toString().split('\n');

            const searchString = '__webpack_exec__';
            const replaceString = '__webpack_exec_proxy__';

            const originalExec = replaceSource.findIndex((s: string) =>
              s.includes(searchString)
            );

            if (originalExec === -1) {
              return source;
            }

            const firstHalf = replaceSource.slice(0, originalExec + 1);
            const secondHalf = replaceSource.slice(
              originalExec + 1,
              replaceSource.length
            );
            // Push renamed exec pack into new source
            newSource.push(
              firstHalf.join('\n').replace(searchString, replaceString)
            );

            newSource.push(`
            var ${searchString} = function(moduleId) {
return __webpack_require__.own_remote.then(function(thing){
return Promise.all(__webpack_require__.initRemotes);
}).then(function(){
return Promise.all(__webpack_require__.initConsumes);
}).then(function(){
return ${replaceString}(moduleId);
})
             };
              `);

            return Template.asString([
              '',
              'var currentChunkId = "__INSERT_CH_ID__MF__";',
              `if(currentChunkId) {`,
              Template.indent([
                `__webpack_require__.getEagerSharedForChunkId(currentChunkId,__webpack_require__.initRemotes);`,
                `__webpack_require__.getEagerRemotesForChunkId(currentChunkId,__webpack_require__.initConsumes)`,
              ]),
              '}',
              ...newSource,
              ...secondHalf,
              '',
            ]);
          }
        );
      }
    );
  }
}

export default InvertedContainerPlugin;
