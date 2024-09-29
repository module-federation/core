'use strict';

import type { Compiler, container } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';
import EntryChunkTrackerPlugin from './EntryChunkTrackerPlugin';
/**
 * Interface for NodeFederationOptions which extends ModuleFederationPluginOptions
 * @interface
 * @property {boolean} debug - Optional debug flag
 */
interface NodeFederationOptions extends ModuleFederationPluginOptions {
  debug?: boolean;
  useRuntimePlugin?: boolean;
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
  private useRuntimePlugin?: boolean;

  /**
   * Create a NodeFederationPlugin.
   * @constructor
   * @param {NodeFederationOptions} options - The options for the NodeFederationPlugin
   * @param {Context} context - The context for the NodeFederationPlugin
   */
  constructor(
    { debug, useRuntimePlugin, ...options }: NodeFederationOptions,
    context: Context,
  ) {
    this._options = options || ({} as ModuleFederationPluginOptions);
    this.context = context || ({} as Context);
    this.useRuntimePlugin = useRuntimePlugin || false;
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
    new EntryChunkTrackerPlugin({}).apply(compiler);
  }

  private preparePluginOptions(): ModuleFederationPluginOptions {
    this._options.runtimePlugins = [
      ...(this.useRuntimePlugin ? [require.resolve('../runtimePlugin')] : []),
      ...(this._options.runtimePlugins || []),
    ];

    return {
      ...this._options,
      remotes: this._options.remotes || {},
      runtimePlugins: this._options.runtimePlugins,
      // enable dts in browser by default
      dts: this._options.dts ?? false,
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
