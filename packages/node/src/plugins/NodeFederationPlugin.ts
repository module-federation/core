'use strict';

import type { Compiler, container } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';

/**
 * Interface for NodeFederationOptions which extends ModuleFederationPluginOptions
 * @interface
 * @property {Record<string, unknown>} experiments - Optional experiments configuration
 * @property {boolean} debug - Optional debug flag
 */
interface NodeFederationOptions extends ModuleFederationPluginOptions {
  experiments?: Record<string, unknown>;
  debug?: boolean;
}

/**
 * Interface for Context
 * @interface
 * @property {typeof container.ModuleFederationPlugin} ModuleFederationPlugin - Optional ModuleFederationPlugin
 */
interface Context {
  ModuleFederationPlugin?: typeof container.ModuleFederationPlugin;
}

/**
 * Class representing a NodeFederationPlugin.
 * @class
 */
class NodeFederationPlugin {
  private _options: ModuleFederationPluginOptions;
  private context: Context;
  private experiments: NodeFederationOptions['experiments'];

  /**
   * Create a NodeFederationPlugin.
   * @constructor
   * @param {NodeFederationOptions} options - The options for the NodeFederationPlugin
   * @param {Context} context - The context for the NodeFederationPlugin
   */
  constructor(
    { experiments, debug, ...options }: NodeFederationOptions,
    context: Context,
  ) {
    this._options = options || ({} as ModuleFederationPluginOptions);
    this.context = context || ({} as Context);
    this.experiments = experiments || {};
  }

  /**
   * Apply method for the NodeFederationPlugin class.
   * @method
   * @param {Compiler} compiler - The webpack compiler.
   */
  apply(compiler: Compiler) {
    const { webpack } = compiler;
    const pluginOptions = this.preparePluginOptions();
    this.updateCompilerOptions(compiler);
    const ModuleFederationPlugin = this.getModuleFederationPlugin(
      compiler,
      webpack,
    );
    new ModuleFederationPlugin(pluginOptions).apply(compiler);
  }

  private preparePluginOptions(): ModuleFederationPluginOptions {
    return {
      ...this._options,
      remotes: this._options.remotes || {},
    };
  }

  private updateCompilerOptions(compiler: Compiler): void {
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

  private getModuleFederationPlugin(compiler: Compiler, webpack: any): any {
    let ModuleFederationPlugin;
    try {
      return require('@module-federation/enhanced').ModuleFederationPlugin;
    } catch (e) {
      console.error(
        "Can't find @module-federation/enhanced, falling back to webpack ModuleFederationPlugin, this may not work",
      );
      if (this.context.ModuleFederationPlugin) {
        ModuleFederationPlugin = this.context.ModuleFederationPlugin;
      } else if (
        webpack &&
        webpack.container &&
        webpack.container.ModuleFederationPlugin
      ) {
        ModuleFederationPlugin = webpack.container.ModuleFederationPlugin;
      } else {
        ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
      }
      return ModuleFederationPlugin;
    }
  }
}

export default NodeFederationPlugin;
