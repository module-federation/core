import type { Compilation, Compiler, Chunk } from 'webpack';
import InvertedContainerRuntimeModule from './InvertedContainerRuntimeModule';

/**
 * @typedef {Object} EmbeddedContainerOptions
 * @property {string} runtime - The runtime of the plugin
 * @property {string} [container] - The container of the plugin
 * @property {string} chunkToEmbed - The chunk to embed in the plugin
 */
export interface EmbeddedContainerOptions {
  runtime: string;
  container?: string;
  chunkToEmbed: string;
}

/**
 * EmbeddedContainerPlugin class for Webpack.
 * @class
 */
class EmbeddedContainerPlugin {
  private options: EmbeddedContainerOptions;

  /**
   * Constructor for the EmbeddedContainerPlugin.
   * @param {EmbeddedContainerOptions} options - The options for the plugin
   */
  constructor(options: EmbeddedContainerOptions) {
    this.options = options;
  }

  /**
   * Process the given chunks.
   * @param {Iterable<Chunk>} chunks - The chunks to process
   * @param {Compilation} compilation - The compilation of the plugin
   * @returns {void}
   * @private
   */
  private processChunks(
    chunks: Iterable<Chunk>,
    compilation: Compilation,
  ): void {
    const relevantChunks = new Map();
    for (const chunk of chunks) {
      if (
        chunk.name &&
        [
          this.options.runtime,
          this.options.container,
          this.options.chunkToEmbed,
        ].includes(chunk.name)
      ) {
        relevantChunks.set(chunk.name, chunk);
      }
    }

    const runtimeChunk = relevantChunks.get(this.options.runtime);
    const partialContainerChunk = relevantChunks.get(this.options.chunkToEmbed);

    if (partialContainerChunk && runtimeChunk) {
      const chunkGraph = compilation.chunkGraph;
      for (const module of chunkGraph.getChunkModulesIterable(
        partialContainerChunk,
      )) {
        chunkGraph.connectChunkAndModule(runtimeChunk, module);
        chunkGraph.disconnectChunkAndModule(partialContainerChunk, module);
      }
    }
  }

  /**
   * Apply the plugin to the given compiler.
   * @param {Compiler} compiler - The compiler to apply the plugin to
   * @returns {void}
   * @public
   */
  public apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'EmbeddedContainerPlugin',
      (compilation: Compilation) => {
        // Hook into the optimizeChunks phase
        compilation.hooks.optimizeChunks.tap(
          'EmbeddedContainerPlugin',
          (chunks) => this.processChunks(chunks, compilation),
        );

        // Add the runtime module
        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'EmbeddedContainerPlugin',
          (chunk, set) => {
            const runtimeModuleOptions = {
              runtime: this.options.runtime,
              remotes: {}, // Replace with actual remotes
              name: this.options.container,
              debug: false, // Replace with actual debug flag
              container: this.options.container,
            };

            compilation.addRuntimeModule(
              chunk,
              new InvertedContainerRuntimeModule(runtimeModuleOptions),
            );
          },
        );
      },
    );
  }
}

export default EmbeddedContainerPlugin;
