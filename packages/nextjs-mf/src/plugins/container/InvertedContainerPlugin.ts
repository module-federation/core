import type { Chunk, Compilation, Compiler } from 'webpack';
//@ts-ignore
import type { ModuleFederationPluginOptions } from '../types';
import InvertedContainerRuntimeModule from './InvertedContainerRuntimeModule';
import { RuntimeGlobals } from 'webpack';

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
          set.add(RuntimeGlobals.asyncModule);

          // Mark the chunk as processed by adding it to the WeakSet.
          onceForChunkSet.add(chunk);

          if (chunk.hasRuntime()) {
            // Add an InvertedContainerRuntimeModule to the chunk, which handles
            // the runtime logic for loading remote modules.
            compilation.addRuntimeModule(
              chunk,
              new InvertedContainerRuntimeModule(set, this.options, {
                webpack: compiler.webpack,
              })
            );
          }
        };

        // Hook the handler function into the compilation process.
        compilation.hooks.additionalChunkRuntimeRequirements.tap(
          'InvertedContainerPlugin',
          handler
        );

        compilation.hooks.optimizeChunks.tap(
          'AddModulesToRuntimeChunkPlugin',
          (chunks) => {
            const containerEntryModule =
              this.resolveContainerModule(compilation);
            if (!containerEntryModule) return;
            for (const chunk of chunks) {
              if (chunk.hasRuntime()) {
                if (
                  !compilation.chunkGraph.isModuleInChunk(
                    containerEntryModule,
                    chunk
                  )
                ) {
                  this.options.debug &&
                    console.log(
                      'adding',
                      //@ts-ignore
                      containerEntryModule._name,
                      'to',
                      chunk.name
                    );
                  // compilation.chunkGraph.connectChunkAndModule(
                  //   chunk,
                  //   containerEntryModule
                  // );
                }
              }
            }
          }
        );
      }
    );
  }
}

export default InvertedContainerPlugin;
