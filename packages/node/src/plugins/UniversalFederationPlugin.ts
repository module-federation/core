/**
 * Importing necessary plugins and types
 */
import StreamingTargetPlugin from './StreamingTargetPlugin';
import NodeFederationPlugin from './NodeFederationPlugin';
import { ModuleFederationPluginOptions } from '../types';
import type { Compiler, container } from 'webpack';
import {
  getWebpackPath,
  normalizeWebpackPath,
} from '@module-federation/sdk/normalize-webpack-path';

/**
 * Interface for NodeFederationOptions
 * @property {boolean} isServer - Indicates if the server is running
 * @property {string} [promiseBaseURI] - The base URI for the promise
 * @property {boolean} [debug] - Indicates if debug mode is enabled
 */
interface NodeFederationOptions extends ModuleFederationPluginOptions {
  isServer: boolean;
  promiseBaseURI?: string;
  debug?: boolean;
}

/**
 * Interface for NodeFederationContext
 * @property {typeof container.ModuleFederationPlugin} [ModuleFederationPlugin] - The ModuleFederationPlugin from webpack container
 */
interface NodeFederationContext {
  ModuleFederationPlugin?: typeof container.ModuleFederationPlugin;
}

/**
 * Class representing a UniversalFederationPlugin
 */
class UniversalFederationPlugin {
  private _options: NodeFederationOptions;
  private context: NodeFederationContext;

  /**
   * Create a UniversalFederationPlugin
   * @param {NodeFederationOptions} options - The options for the plugin
   * @param {NodeFederationContext} context - The context for the plugin
   */
  constructor(options: NodeFederationOptions, context: NodeFederationContext) {
    this._options = options || ({} as NodeFederationOptions);
    this.context = context || ({} as NodeFederationContext);
  }

  /**
   * Apply the plugin to the compiler
   * @param {Compiler} compiler - The webpack compiler
   */
  apply(compiler: Compiler) {
    const { isServer, debug, ...options } = this._options;
    const { webpack } = compiler;
    if (!process.env['FEDERATION_WEBPACK_PATH']) {
      process.env['FEDERATION_WEBPACK_PATH'] = getWebpackPath(compiler);
    }
    if (
      isServer ||
      compiler.options.name === 'server' ||
      compiler.options.target === 'node' ||
      compiler.options.target === 'async-node'
    ) {
      new NodeFederationPlugin(options, this.context).apply(compiler);
      new StreamingTargetPlugin({ ...options, debug }).apply(compiler);
    } else {
      new (this.context.ModuleFederationPlugin ||
        (webpack && webpack.container.ModuleFederationPlugin) ||
        require(
          normalizeWebpackPath('webpack/lib/container/ModuleFederationPlugin'),
        ))(options).apply(compiler);
    }
  }
}

/**
 * Exporting UniversalFederationPlugin as default
 */
export default UniversalFederationPlugin;
