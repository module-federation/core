'use strict';

import type { Compiler, container } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';
import { parseRemotes } from "./commonUtilities";
import {ModuleInfoRuntimePlugin} from '@module-federation/enhanced';

/**
 * Interface for NodeFederationOptions which extends ModuleFederationPluginOptions
 * @interface NodeFederationOptions
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
   * @param {NodeFederationOptions} opts - The options for the NodeFederationPlugin
   * @param {Context} context - The context for the NodeFederationPlugin
   */
  constructor(
    opts: NodeFederationOptions,
    context: Context,
  ) {
    // @todo debug flag is not used
    const { experiments, debug, ...options } = opts;
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
    new ModuleInfoRuntimePlugin().apply(compiler);
    const pluginOptions = this.preparePluginOptions();
    this.updateCompilerOptions(compiler);
    const ModuleFederationPlugin = this.getModuleFederationPlugin(compiler);
    new ModuleFederationPlugin(pluginOptions).apply(compiler);
  }

  private preparePluginOptions(): ModuleFederationPluginOptions {
    return {
      ...this._options,
      remotes: this._options.remotes
        ? parseRemotes(this._options.remotes as Record<string, any>)
        : {},
    };
  }

  private updateCompilerOptions(compiler: Compiler): void {
    if (compiler.options && compiler.options.output) {
      compiler.options.output.importMetaName = 'remoteContainerRegistry';
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

  private getModuleFederationPlugin(compiler: Compiler): typeof container.ModuleFederationPlugin {
    if(this.context.ModuleFederationPlugin) {
      return this.context.ModuleFederationPlugin;
    }
    if(compiler.webpack.container?.ModuleFederationPlugin) {
      return compiler.webpack.container.ModuleFederationPlugin;
    }
    return this.loadModuleFederationPlugin();
  }

  private loadModuleFederationPlugin(): typeof container.ModuleFederationPlugin {
    try {
      return require('@module-federation/enhanced').ModuleFederationPlugin;
    } catch (e) {
      return require('webpack/lib/container/ModuleFederationPlugin')
    }
  }
}

export default NodeFederationPlugin;

