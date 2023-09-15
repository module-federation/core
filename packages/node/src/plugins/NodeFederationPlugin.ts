'use strict';

import type { Compiler, container } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';
import { extractUrlAndGlobal } from '@module-federation/utilities/src/utils/pure';
import {ModuleInfoRuntimePlugin} from '@module-federation/enhanced'

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

// possible remote evaluators
// this depends on the chunk format selected.
// commonjs2 - it think, is lazily evaluated - beware
// const remote = eval(scriptContent + '\n  try{' + moduleName + '}catch(e) { null; };');
// commonjs - fine to use but exports marker doesnt exist
// const remote = eval('let exports = {};' + scriptContent + 'exports');
// commonjs-module, ideal since it returns a commonjs module format
// const remote = eval(scriptContent + 'module.exports')

/**
 * This function parses the remotes and checks if they are internal or not.
 * If it's an internal remote then we add it to our new object with a key of the name of the remote and value as internal.
 * If it's not an internal remote then we check if there is a '@' in that string which means that this is probably a github repo.
 * @function
 * @param {Record<string, any>} remotes - The remotes to parse
 * @returns {Record<string, string>} The parsed remotes
 */
export const parseRemotes = (remotes: Record<string, any>) =>
  Object.entries(remotes).reduce((acc, remote) => {
    if (remote[1].startsWith('internal ')) {
      acc[remote[0]] = remote[1];
      return acc;
    }
    if (!remote[1].startsWith('promise ') && remote[1].includes('@')) {
      acc[remote[0]] = `promise ${parseRemoteSyntax(remote[1])}`;
      return acc;
    }
    acc[remote[0]] = remote[1];
    return acc;
  }, {} as Record<string, string>);
// server template to convert remote into promise new promise and use require.loadChunk to load the chunk
/**
 * This function generates a remote template.
 * @function
 * @param {string} url - The url of the remote
 * @param {any} global - The global variable
 * @returns {string} The generated remote template
 */
export const generateRemoteTemplate = (
  url: string,
  global: any
) => `new Promise(function (resolve, reject) {
    if(!globalThis.__remote_scope__) {
      // create a global scope for container, similar to how remotes are set on window in the browser
      globalThis.__remote_scope__ = {
        _config: {},
      }
    }

    if (typeof globalThis.__remote_scope__[${JSON.stringify(
      global
    )}] !== 'undefined') return resolve(globalThis.__remote_scope__[${JSON.stringify(
  global
)}]);
    globalThis.__remote_scope__._config[${JSON.stringify(
      global
    )}] = ${JSON.stringify(url)};
    var __webpack_error__ = new Error();

    __webpack_require__.l(
      ${JSON.stringify(url)},
      function (event) {
        if (typeof globalThis.__remote_scope__[${JSON.stringify(
          global
        )}] !== 'undefined') return resolve(globalThis.__remote_scope__[${JSON.stringify(
  global
)}]);
         var realSrc = event && event.target && event.target.src;
        __webpack_error__.message = 'Loading script failed.\\n(' + event.message + ': ' + realSrc + ')';
        __webpack_error__.name = 'ScriptExternalLoadError';
        __webpack_error__.stack = event.stack;
        reject(__webpack_error__);
      },
      ${JSON.stringify(global)},
    );
  }).catch((e)=> {
    console.error(${JSON.stringify(
      global
    )}, 'is offline, returning fake remote');
    console.error(e);

    return {
      fake: true,
      get: (arg) => {
        console.warn('faking', arg, 'module on', ${JSON.stringify(global)});

        return Promise.resolve(() => {
          return () => null
        });
      },
      init: () => {
      }
    }
  }).then(function (remote) {
    if(remote.fake) {
      return remote;
    }
    return remote;
  })`;

/**
 * This function takes the remote string and splits it into two parts.
 * The first part of the split is going to be a url which will be used in generate Remote Template function.
 * The second part of the split is going to be a global variable name which will also be used in generate Remote Template function.
 * If there's no global variable name then we'll use default as default value for that parameter.
 * @function
 * @param {any} remote - The remote to parse
 * @returns {any} The parsed remote
 */
export const parseRemoteSyntax = (remote: any) => {
  if (typeof remote === 'string' && remote.includes('@')) {
    const [url, global] = extractUrlAndGlobal(remote);
    return generateRemoteTemplate(url, global);
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
    this._options = options || ({} as ModuleFederationPluginOptions);
    this.context = context || ({} as Context);
    this.experiments = experiments || {};
  }

  /**
   * Apply the NodeFederationPlugin.
   * @method
   * @param {Compiler} compiler - The webpack compiler
   */
  apply(compiler: Compiler) {
    // When used with Next.js, context is needed to use Next.js webpack
    const { webpack } = compiler;

    new ModuleInfoRuntimePlugin().apply(compiler);
    const pluginOptions = {
      ...this._options,
      remotes: parseRemotes(
        this._options.remotes || {}
      ) as ModuleFederationPluginOptions['remotes'],
    };

    const chunkFileName = compiler.options?.output?.chunkFilename;
    const uniqueName =
      compiler?.options?.output?.uniqueName || this._options.name;

    if (typeof chunkFileName === 'string') {
      const requiredSubstrings = [
        '[chunkhash]',
        '[contenthash]',
        '[fullHash]',
        uniqueName,
      ];

      if (
        //@ts-ignore
        !requiredSubstrings.some((substring) =>
          //@ts-ignore
          chunkFileName.includes(substring)
        )
      ) {
        const suffix =
          compiler.options.mode === 'development'
            ? `.[chunkhash].js`
            : `.[chunkhash].js`;
        compiler.options.output.chunkFilename = chunkFileName.replace(
          '.js',
          suffix
        );
      }
    }

    new (this.context.ModuleFederationPlugin ||
      (webpack && webpack.container.ModuleFederationPlugin) ||
      require('webpack/lib/container/ModuleFederationPlugin'))(
      pluginOptions
    ).apply(compiler);
  }
}

export default NodeFederationPlugin;
