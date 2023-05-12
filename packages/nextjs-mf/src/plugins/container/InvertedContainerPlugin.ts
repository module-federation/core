import type { Chunk, Compilation, Compiler } from 'webpack';
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
          set.add(RuntimeGlobals.startupOnlyAfter);

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

        // Hook the handler function into the compilation process.
        compilation.hooks.additionalChunkRuntimeRequirements.tap(
          'InvertedContainerPlugin',
          handler
        );

        compilation.hooks.afterOptimizeChunks.tap(
          'InvertedContainerPlugin',
          (chunks) => {
            for (const chunk of chunks) {
              if (chunk.hasRuntime()) {
                //@ts-ignore
                if (chunk.name === this.options?.container) {
                  for (const mod of chunk.getModules()) {
                    if (mod.type === 'provide-shared') {
                      compilation.chunkGraph.disconnectChunkAndModule(
                        chunk,
                        mod
                      );
                    }
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
              if (chunk.hasRuntime()) {
                //@ts-ignore

                if (chunk.name === this.options?.container) {
                  const eagerModulesInRemote =
                    compilation.chunkGraph.getChunkModulesIterableBySourceType(
                      chunk,
                      'provide-module'
                    );

                  const moduels = chunk.getModules();
                  for (const module of moduels) {
                    if (module.type === 'provide-module') {
                      compilation.chunkGraph.disconnectChunkAndModule(
                        chunk,
                        module
                      );
                    }
                  }
                }
                console.log(
                  'chunk',
                  chunk.name,
                  !compilation.chunkGraph.isModuleInChunk(
                    containerEntryModule,
                    chunk
                  )
                );
                if (
                  !compilation.chunkGraph.isModuleInChunk(
                    containerEntryModule,
                    chunk
                  )
                ) {
                  // if its the browser runtime, inject the container module into the host runtime
                  // TODO: try and do the same on the server,
                  // if (this.options.runtime === 'webpack-runtime') {
                  compilation.chunkGraph.connectChunkAndModule(
                    chunk,
                    containerEntryModule
                  );
                  // }
                }
              }
            }
          }
        );
        // if (compiler.options.name === 'client') return;
        const hooks =
          compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
            compilation
          );
        compilation.hooks.afterOptimizeChunkAssets.tap(
          'ChunkIdPlugin',
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
                  //@ts-ignore
                  const sourceObj = {
                    source: () => sourceBuffer,
                    size: () => sourceBuffer.length,
                  };
                  // @ts-ignore
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
            let currentChunkID: string | number | null = null;
            for (const chunk of compilation.chunks) {
              if (
                chunk.isOnlyInitial() &&
                compilation.chunkGraph.isModuleInChunk(renderContext, chunk)
              ) {
                currentChunkID = chunk.id;
              }
            }
            // Push renamed exec pack into new source
            newSource.push(
              firstHalf.join('\n').replace(searchString, replaceString)
            );

            newSource.push(`
            var ${searchString} = function(moduleId) {
return __webpack_require__.own_remote.then((thing)=>{
// console.log('loaded pages remote if exists:',currentChunkId);
return Promise.all(__webpack_require__.initRemotes);
}).then(()=>{
// console.log('loaded pages remote if exists:',currentChunkId);
return Promise.all(__webpack_require__.initConsumes);
}).then(()=>{
// console.log('async startup for entrypoint done');
// console.log('SUOULD REQUIRE PAged,m', moduleId);
// console.log('SCOPE MEMORY CHECK',__webpack_require__.S === globalThis.backupScope);
// console.log('SCOPE MEMORY CHECK',Object.keys(__webpack_require__.S), Object.keys(globalThis.backupScope))
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
