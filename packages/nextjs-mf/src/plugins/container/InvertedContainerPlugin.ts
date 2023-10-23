import type Compiler from 'webpack/lib/Compiler';
import { ModuleFederationPluginOptions } from './types';
import EmbeddedContainerPlugin from './EmbeddedContainerPlugin';
import { AsyncBoundaryPlugin } from '@module-federation/enhanced';

/**
 * This interface includes additional fields specific to the plugin's behavior.
 * @interface InvertedContainerOptions
 * @extends {ModuleFederationPluginOptions}
 * @property {string} [container] - The container name.
 * @property {Record<string, string>} remotes - A map of remote modules to their URLs.
 * @property {string} runtime - The name of the current module.
 * @property {boolean} [debug] - A flag to enable debug logging.
 * @property {string} chunkToEmbed - The chunk to embed.
 */
interface InvertedContainerOptions extends ModuleFederationPluginOptions {
  container?: string;
  remotes: Record<string, string>;
  runtime: string;
  debug?: boolean;
  chunkToEmbed: string;
}

/**
 * InvertedContainerPlugin is a Webpack plugin that handles loading of chunks in a federated module.
 * @class
 */
class InvertedContainerPlugin {
  private options: InvertedContainerOptions;

  /**
   * Constructor for the InvertedContainerPlugin.
   * @param {InvertedContainerOptions} options - Plugin configuration options.
   */
  constructor(options: InvertedContainerOptions) {
    this.options = options;
  }

  /**
   * Apply method for the Webpack plugin, handling the plugin logic and hooks.
   * @param {Compiler} compiler - Webpack compiler instance.
   */
  public apply(compiler: Compiler): void {
    new EmbeddedContainerPlugin({
      runtime: this.options.runtime,
      container: this.options.container,
      chunkToEmbed: this.options.chunkToEmbed,
    }).apply(compiler);

    const asyncBoundaryPlugin = new AsyncBoundaryPlugin();
    asyncBoundaryPlugin.hooks.checkInvalidContext.tap(
      'InvertedContainerPlugin',
      (renderContext, compilation) => {
        return (
          !renderContext ||
          //@ts-ignore
          renderContext?._name ||
          //@ts-ignore
          !renderContext?.debugId ||
          //@ts-ignore
          !compilation.chunkGraph.isEntryModule(renderContext) ||
          //@ts-ignore
          renderContext?.rawRequest?.includes('pages/api') ||
          //@ts-ignore
          renderContext?.layer === 'api'
        );
      },
    );

    asyncBoundaryPlugin.apply(compiler);
  }
}

export default InvertedContainerPlugin;
