'use strict';

import type { Compiler, container } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';
import { extractUrlAndGlobal } from '@module-federation/utilities/src/utils/pure';
import {ModuleInfoRuntimePlugin} from '@module-federation/enhanced';

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
 * This function iterates over all remotes and checks if they
 * are internal or not. If it's an internal remote then we add it to our new object
 * with a key of the name of the remote and value as internal. If it's not an internal
 * remote then we check if there is a '@' in that string which likely means it is a global @ url
 *
 * @param {Record<string, any>} remotes - The remotes to parse.
 * @returns {Record<string, string>} - The parsed remotes.
 * */

export const parseRemotes = (
  remotes: Record<string, any>,
): Record<string, string> => {
  if (!remotes || typeof remotes !== 'object') {
    throw new Error('remotes must be an object');
  }

  return Object.entries(remotes).reduce(
    (acc: Record<string, string>, [key, value]) => {
      const isInternal = value.startsWith('internal ');
      const isGlobal =
        value.includes('@') &&
        !['window.', 'global.', 'globalThis.', 'self.'].some((prefix) =>
          value.startsWith(prefix),
        );

      acc[key] = isInternal || !isGlobal ? value : parseRemoteSyntax(value);

      return acc;
    },
    {},
  );
};
/**
 * Parses the remote syntax and returns a formatted string if the remote includes '@' and does not start with 'window', 'global', or 'globalThis'.
 * Otherwise, it returns the original remote string.
 *
 * @param {string} remote - The remote string to parse.
 * @returns {string} - The parsed remote string or the original remote string.
 * @throws {Error} - Throws an error if the remote is not a string.
 */
export const parseRemoteSyntax = (remote: any): string => {
  if (typeof remote !== 'string') {
    throw new Error('remote must be a string');
  }

  if (remote.includes('@')) {
    const [url, global] = extractUrlAndGlobal(remote);
    if (
      !['window.', 'global.', 'globalThis.'].some((prefix) =>
        global.startsWith(prefix),
      )
    ) {
      return `globalThis.__remote_scope__.${global}@${url}`;
    }
  }
  return remote;
};

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
    new ModuleInfoRuntimePlugin().apply(compiler);
    const pluginOptions = this.preparePluginOptions();
    this.updateCompilerOptions(compiler);
    const ModuleFederationPlugin = this.getModuleFederationPlugin(compiler, webpack);
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

  private getModuleFederationPlugin(compiler: Compiler, webpack: any): any {
    let ModuleFederationPlugin;
    if(this.context.ModuleFederationPlugin) {
      ModuleFederationPlugin = this.context.ModuleFederationPlugin;
    } else if(webpack && webpack.container && webpack.container.ModuleFederationPlugin) {
      ModuleFederationPlugin = webpack.container.ModuleFederationPlugin;
    } else {
      ModuleFederationPlugin = this.loadModuleFederationPlugin();
    }
    return ModuleFederationPlugin;
  }

  private loadModuleFederationPlugin(): any {
    let ModuleFederationPlugin;
    try {
      ModuleFederationPlugin = require('@module-federation/enhanced').ModuleFederationPlugin;
    } catch (e) {
      ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
    }
    return ModuleFederationPlugin;
  }
}

export default NodeFederationPlugin;

