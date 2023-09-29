/**
 * Importing necessary plugins and types
 */
import StreamingTargetPlugin from './StreamingTargetPlugin';
import NodeFederationPlugin from './NodeFederationPlugin';
import { ModuleFederationPluginOptions } from '../types';
import type { Compiler, container } from 'webpack';

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

const defaultNodeFederationOptions = {} as NodeFederationOptions;

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
  /**
   * Create a UniversalFederationPlugin
   * @param {NodeFederationOptions} _options - The options for the plugin
   * @param {NodeFederationContext} context - The context for the plugin
   */
  constructor(
      private readonly _options: NodeFederationOptions = defaultNodeFederationOptions,
      private context: NodeFederationContext = {}
  ) {
  }

  /**
   * Apply the plugin to the compiler
   * @param {Compiler} compiler - The webpack compiler
   */
  apply(compiler: Compiler) {
    const { isServer, debug, ...options } = this._options;
    if (this.isServer(compiler)) {
      return this.applyServerPlugins(compiler, { ...options, debug });
    }
    return this.applyModuleFederationPlugin(compiler, options);
  }

  /**
   * Apply the NodeFederationPlugin and StreamingTargetPlugin to the compiler
   * @param compiler
   * @param options
   * @private
   */
  private applyServerPlugins(
      compiler: Compiler,
      options: Omit<NodeFederationOptions, 'isServer'>
  ): void {
    new NodeFederationPlugin(options, this.context).apply(compiler);
    new StreamingTargetPlugin(options).apply(compiler);
  }

  /**
   * Apply the ModuleFederationPlugin to the compiler
   * @param compiler
   * @param options
   * @private
   */
  private applyModuleFederationPlugin(
      compiler: Compiler,
      options: Omit<NodeFederationOptions, 'isServer' | 'debug'>
  ): void {
    const ModuleFederationPlugin = (
        this.context.ModuleFederationPlugin ||
        (compiler.webpack.container?.ModuleFederationPlugin) ||
        require('webpack/lib/container/ModuleFederationPlugin')
    );
    new ModuleFederationPlugin(options).apply(compiler);
  }

  /**
   * Whether the compiler is running on the server or
   * is configured to run on the server
   * @param compiler
   * @private
   */
  private isServer(compiler: Compiler): boolean {
    return (
        this._options.isServer ||
        compiler.options.name === 'server' ||
        compiler.options.target === 'node' ||
        compiler.options.target === 'async-node'
    );
  }
}

/**
 * Exporting UniversalFederationPlugin as default
 */
export default UniversalFederationPlugin;
