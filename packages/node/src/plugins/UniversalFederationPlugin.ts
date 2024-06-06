/**
 * Importing necessary plugins and types
 */
import StreamingTargetPlugin from './StreamingTargetPlugin';
import NodeFederationPlugin from './NodeFederationPlugin';
import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';
import { ModuleFederationPluginOptions } from '../types';
import type { Compiler, container } from 'webpack';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

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
  useRuntimePlugin?: boolean;
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
  private name: string;

  /**
   * Create a UniversalFederationPlugin
   * @param {NodeFederationOptions} options - The options for the plugin
   * @param {NodeFederationContext} context - The context for the plugin
   */
  constructor(options: NodeFederationOptions, context: NodeFederationContext) {
    this._options = options || ({} as NodeFederationOptions);
    this.context = context || ({} as NodeFederationContext);
    this.name = 'ModuleFederationPlugin';
    if (this._options.useRuntimePlugin && this._options.isServer) {
      this._options.runtimePlugins = this._options.runtimePlugins
        ? this._options.runtimePlugins.concat([
            require.resolve('../runtimePlugin.js'),
          ])
        : [require.resolve('../runtimePlugin.js')];
    }
  }

  private updateCompilerOptions(compiler: Compiler): void {
    compiler.options.output.chunkFormat = 'commonjs';
    if (compiler.options.output.enabledLibraryTypes === undefined) {
      compiler.options.output.enabledLibraryTypes = ['commonjs-module'];
    } else {
      compiler.options.output.enabledLibraryTypes.push('commonjs-module');
    }

    const chunkFileName = compiler.options?.output?.chunkFilename;
    const uniqueName =
      compiler?.options?.output?.uniqueName || this._options.name;
    if (
      typeof chunkFileName === 'string' &&
      uniqueName &&
      !chunkFileName.includes(uniqueName)
    ) {
      const suffix = `-[chunkhash].js`;
      compiler.options.output.chunkFilename = chunkFileName.replace(
        '.js',
        suffix,
      );
    }
  }

  /**
   * Apply the plugin to the compiler
   * @param {Compiler} compiler - The webpack compiler
   */
  apply(compiler: Compiler) {
    const { isServer, debug, useRuntimePlugin, ...options } = this._options;
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
      if (useRuntimePlugin) {
        this.updateCompilerOptions(compiler);
        new ModuleFederationPlugin({
          ...options,
        }).apply(compiler);
      } else {
        new NodeFederationPlugin(options, this.context).apply(compiler);
        new StreamingTargetPlugin({ ...options, debug }).apply(compiler);
      }
    } else {
      new ModuleFederationPlugin(options).apply(compiler);
    }
  }
}

/**
 * Exporting UniversalFederationPlugin as default
 */
export default UniversalFederationPlugin;
