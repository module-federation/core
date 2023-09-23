import type { Compiler } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';

import CommonJsChunkLoadingPlugin from './CommonJsChunkLoadingPlugin';

/**
 * Interface for StreamingTargetOptions which extends ModuleFederationPluginOptions
 * @property {string} promiseBaseURI - The base URI for the promise
 * @property {boolean} debug - Flag to enable/disable debug mode
 */
interface StreamingTargetOptions extends ModuleFederationPluginOptions {
  promiseBaseURI?: string;
  debug?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
/**
 * Interface for StreamingTargetContext
 */
interface StreamingTargetContext {}

/**
 * Class representing a StreamingTargetPlugin
 */
class StreamingTargetPlugin {
  private options: StreamingTargetOptions;

  /**
   * Create a StreamingTargetPlugin
   * @param {StreamingTargetOptions} options - The options for the plugin
   */
  constructor(options: StreamingTargetOptions) {
    this.options = options || {};
  }

  /**
   * Apply the plugin to the compiler
   * @param {Compiler} compiler - The webpack compiler
   */
  apply(compiler: Compiler) {
    if (compiler.options.target) {
      console.warn(
        `target should be set to false while using NodeSoftwareStreamRuntime plugin, actual target: ${compiler.options.target}`,
      );
      console.info('Setting target to false');
      compiler.options.target = false;
    }

    // When used with Next.js, context is needed to use Next.js webpack
    const { webpack } = compiler;

    // This will enable CommonJsChunkFormatPlugin
    compiler.options.output.chunkFormat = 'commonjs';
    // This will force async chunk loading
    compiler.options.output.chunkLoading = 'async-node';

    // Disable default config
    // FIXME: enabledChunkLoadingTypes is of type 'string[] | undefined'
    // Can't use the 'false' value as it isn't the right format,
    // Emptying it out ensures theres no other readFileVm added to webpack runtime
    compiler.options.output.enabledChunkLoadingTypes = [];
    compiler.options.output.environment = {
      ...compiler.options.output.environment,
      dynamicImport: true,
    };

    new (webpack?.node?.NodeEnvironmentPlugin ||
      require('webpack/lib/node/NodeEnvironmentPlugin'))({
      infrastructureLogging: compiler.options.infrastructureLogging,
    }).apply(compiler);

    new (webpack?.node?.NodeTargetPlugin ||
      require('webpack/lib/node/NodeTargetPlugin'))().apply(compiler);
    new CommonJsChunkLoadingPlugin({
      asyncChunkLoading: true,
      name: this.options.name,
      remotes: this.options.remotes as Record<string, string>,
      baseURI: compiler.options.output.publicPath,
      promiseBaseURI: this.options.promiseBaseURI,
      debug: this.options.debug,
    }).apply(compiler);
  }
}

export default StreamingTargetPlugin;
