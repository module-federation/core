import type { Chunk, Compilation, Compiler, Module } from 'webpack';
import { RawSource } from 'webpack-sources';
//@ts-ignore
import type { ModuleFederationPluginOptions } from '../types';
import InvertedContainerRuntimeModule from './InvertedContainerRuntimeModule';
import { RuntimeGlobals } from 'webpack';
import Template from '../../../utils/Template';
import RemoveEagerModulesFromRuntimePlugin from './RemoveEagerModulesFromRuntimePlugin';
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
    new RemoveEagerModulesFromRuntimePlugin({
      container: this.options.container,
      debug: this.options.debug,
    }).apply(compiler);

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

        compilation.hooks.optimizeChunks.tap(
          'InvertedContainerPlugin',
          (chunks) => {
            const containerEntryModule =
              this.resolveContainerModule(compilation);
            if (!containerEntryModule) return;
            for (const chunk of chunks) {
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

            const part1 = firstHalf
              .join('\n')
              .replace(searchString, replaceString);

            const part2 = `
            var ${searchString} = function(moduleId) {
return __webpack_require__.own_remote.then(function(thing){
return Promise.all(__webpack_require__.initRemotes);
}).then(function(){
return Promise.all(__webpack_require__.initConsumes);
}).then(function(){
return ${replaceString}(moduleId);
})
             };
              `;

            return Template.asString([
              '',
              'var currentChunkId = "__INSERT_CH_ID__MF__";',
              `if(currentChunkId) {`,
              Template.indent([
                `__webpack_require__.getEagerSharedForChunkId(currentChunkId,__webpack_require__.initRemotes);`,
                `__webpack_require__.getEagerRemotesForChunkId(currentChunkId,__webpack_require__.initConsumes)`,
              ]),
              '}',
              part1,
              part2,
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
