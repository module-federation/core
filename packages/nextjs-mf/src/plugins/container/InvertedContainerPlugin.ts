import type Compiler from 'webpack/lib/Compiler';
import { ModuleFederationPluginOptions } from './types';
import EmbeddedContainerPlugin from './EmbeddedContainerPlugin';
import { AsyncBoundaryPlugin } from '@module-federation/enhanced';
import HoistPseudoEager from './HoistPseudoEagerModules';

/**
 * This interface extends the ModuleFederationPluginOptions interface and includes additional fields 
 * specific to the InvertedContainerPlugin's behavior.
 * @interface InvertedContainerOptions
 * @property {string} [container] - The name of the container.
 * @property {Record<string, string>} remotes - A map of remote modules to their URLs.
 * @property {string} runtime - The name of the current module.
 * @property {boolean} [debug] - A flag to enable debug logging.
 * @property {string} chunkToEmbed - The name of the chunk to embed.
 */
interface InvertedContainerOptions extends ModuleFederationPluginOptions {
  container?: string;
  remotes: Record<string, string>;
  runtime: string;
  debug?: boolean;
  chunkToEmbed: string;
}

/**
 * The InvertedContainerPlugin is a Webpack plugin that manages the loading of chunks in a federated module.
 * @class
 */
class InvertedContainerPlugin {
  private options: InvertedContainerOptions;

  /**
   * Constructs an instance of the InvertedContainerPlugin.
   * @param {InvertedContainerOptions} options - The configuration options for the plugin.
   */
  constructor(options: InvertedContainerOptions) {
    this.options = options;
  }

  /**
   * This method applies the plugin logic and hooks to the Webpack compiler instance.
   * @param {Compiler} compiler - The Webpack compiler instance.
   */
  public apply(compiler: Compiler): void {
    new EmbeddedContainerPlugin({
      runtime: this.options.runtime,
      container: this.options.container,
      chunkToEmbed: this.options.chunkToEmbed,
    }).apply(compiler);

    const asyncBoundaryPlugin = new AsyncBoundaryPlugin().apply(compiler);
    new HoistPseudoEager().apply(compiler);
    // The following code is commented out for future reference.
    // asyncBoundaryPlugin.hooks.checkInvalidContext.tap(
    //   'InvertedContainerPlugin',
    //   (renderContext, compilation) => {
    //     return (
    //       !renderContext ||
    //       //@ts-ignore
    //       renderContext?._name ||
    //       //@ts-ignore
    //       !renderContext?.debugId ||
    //       //@ts-ignore
    //       !compilation.chunkGraph.isEntryModule(renderContext) ||
    //       //@ts-ignore
    //       renderContext?.rawRequest?.includes('pages/api') ||
    //       //@ts-ignore
    //       renderContext?.layer === 'api'
    //     );
    //   },
    // );
    // asyncBoundaryPlugin.apply(compiler);
  }
}

export default InvertedContainerPlugin;
