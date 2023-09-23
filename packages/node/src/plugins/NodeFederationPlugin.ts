'use strict';

import type { Compiler, container } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';
import { extractUrlAndGlobal } from '@module-federation/utilities/src/utils/pure';
//@ts-ignore
const ModuleInfoPlugin = require('@module-federation/enhanced/src/runtime/ModuleInfoRuntimePlugin').default

/**
 * Interface for NodeFederationOptions which extends ModuleFederationPluginOptions
 * @interface
 * @property {Record<string, unknown>} experiments - Optional experiments configuration
 * @property {boolean} debug - Optional debug flag
 */
interface NodeFederationOptions extends ModuleFederationPluginOptions {
  experiments?: Record<string, unknown>;
  debug?: boolean;
  useRemoteSideloader?: boolean;
}

/**
 * Interface for Context
 * @interface
 * @property {typeof container.ModuleFederationPlugin} ModuleFederationPlugin - Optional ModuleFederationPlugin
 */
interface Context {
  ModuleFederationPlugin?: typeof container.ModuleFederationPlugin;
}

// possible remote evaluators
// this depends on the chunk format selected.
// commonjs2 - it think, is lazily evaluated - beware
// const remote = eval(scriptContent + '\n  try{' + moduleName + '}catch(e) { null; };');
// commonjs - fine to use but exports marker doesnt exist
// const remote = eval('let exports = {};' + scriptContent + 'exports');
// commonjs-module, ideal since it returns a commonjs module format
// const remote = eval(scriptContent + 'module.exports')

/**
 * This function iterates over all remotes and checks if they
 * are internal or not. If it's an internal remote then we add it to our new object
 * with a key of the name of the remote and value as internal. If it's not an internal
 * remote then we check if there is a '@' in that string which likely means it is a global @ url
 *
 * @param {Record<string, any>} remotes - The remotes to parse.
 * @returns {Record<string, string>} - The parsed remotes.
 * */

export const parseRemotes = (remotes: Record<string, any>): Record<string, string> => {
  if (!remotes || typeof remotes !== 'object') {
    throw new Error('remotes must be an object');
  }

  return Object.entries(remotes).reduce((acc: Record<string, string>, [key, value]) => {
    const isInternal = value.startsWith('internal ');
    const isGlobal = value.includes('@') && !['window.', 'global.', 'globalThis.','self.'].some(prefix => value.startsWith(prefix));

    acc[key] = isInternal || !isGlobal ? value : parseRemoteSyntax(value);

    return acc;
  }, {});
}
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
    if (!['window.', 'global.', 'globalThis.'].some(prefix => global.startsWith(prefix))) {
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
    context: Context
  ) {
    console.log('NODE FEDERATION PLUGIN', context)
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
    // When used with Next.js, context is needed to use Next.js webpack
    const { webpack } = compiler;


    //TODO: module info runtime should be somewhere universal
    new ModuleInfoPlugin().apply(compiler);
    const pluginOptions = {
      ...this._options,
      remotes: this._options.remotes ? parseRemotes(this._options.remotes as Record<string, any>) : {},
    };
   //TODO can use import meta mock object but need to update data structure of remote_scope
    if (compiler.options && compiler.options.output) {
      compiler.options.output.importMetaName = 'remoteContainerRegistry';
    }

    const chunkFileName = compiler.options?.output?.chunkFilename;
    const uniqueName =
      compiler?.options?.output?.uniqueName || this._options.name;

    if (typeof chunkFileName === 'string' && uniqueName && !chunkFileName.includes(uniqueName)) {
      const suffix = `-[chunkhash].js`;
      compiler.options.output.chunkFilename = chunkFileName.replace('.js', suffix);
    }

    console.log('CONTXT', this.context.ModuleFederationPlugin)

    new (this.context.ModuleFederationPlugin ||
      // (webpack && webpack.container.ModuleFederationPlugin) ||
      require('webpack/lib/container/ModuleFederationPlugin'))(
      pluginOptions
    ).apply(compiler);
  }
}

export default NodeFederationPlugin;
