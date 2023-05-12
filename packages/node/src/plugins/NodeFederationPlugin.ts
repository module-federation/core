'use strict';

import type { Compiler, container } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';
import { extractUrlAndGlobal } from '@module-federation/utilities';

interface NodeFederationOptions extends ModuleFederationPluginOptions {
  experiments?: Record<string, unknown>;
  verbose?: boolean;
}

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

/*
 This code is doing the following It iterates over all remotes and checks if they
 are internal or not If it\'s an internal remote then we add it to our new object
 with a key of the name of the remote and value as internal If it\'s not an internal
 remote then we check if there is a in that string which means that this is probably
 a github repo
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
export const generateRemoteTemplate = (
  url: string,
  global: any
) => `new Promise(function (resolve, reject) {
    if(!global.__remote_scope__) {
      // create a global scope for container, similar to how remotes are set on window in the browser
      global.__remote_scope__ = {
        _config: {},
      }
    }

    if (typeof global.__remote_scope__[${JSON.stringify(
      global
    )}] !== 'undefined') return resolve(global.__remote_scope__[${JSON.stringify(
  global
)}]);
    global.__remote_scope__._config[${JSON.stringify(
      global
    )}] = ${JSON.stringify(url)};
    var __webpack_error__ = new Error();

    __webpack_require__.l(
      ${JSON.stringify(url)},
      function (event) {
        if (typeof global.__remote_scope__[${JSON.stringify(
          global
        )}] !== 'undefined') return resolve(global.__remote_scope__[${JSON.stringify(
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
        console.log('faking', arg, 'module on', ${JSON.stringify(global)});

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
    console.log('got remote interface');
    return remote;
    const proxy = {
      get: (arg)=>{
        return remote.get(arg).then((f)=>{
          const m = f();
          return ()=>new Proxy(m, {
            get: (target, prop)=>{
              if(global.usedChunks) global.usedChunks.add(${JSON.stringify(
                global
              )} + "->" + arg);
              return target[prop];
            }
          })
        })
      },
      init: function(shareScope) {
        const handler = {
          get(target, prop) {
            if (target[prop]) {
              Object.values(target[prop]).forEach(function(o) {
                if(o.from === '_N_E') {
                  o.loaded = 1
                }
              })
            }
            return target[prop]
          },
          set(target, property, value) {
            if(global.usedChunks) global.usedChunks.add(${JSON.stringify(
              global
            )} + "->" + property);
            if (target[property]) {
              return target[property]
            }
            target[property] = value
            return true
          }
        }
        try {
          global.__remote_scope__[${JSON.stringify(
            global
          )}].init(new Proxy(shareScope, handler))
        } catch (e) {

        }
        global.__remote_scope__[${JSON.stringify(global)}].__initialized = true
      }
    }
    try  {
      proxy.init(__webpack_require__.S.default)
    } catch(e) {
      console.error('failed to init', ${JSON.stringify(global)}, e)
    }
    return proxy
  })`;

/*
 This code is taking the remote string and splitting it into two parts The first
 part of the split is going to be a url which will be used in generate Remote Template
 function The second part of the split is going to be a global variable name which
 will also be used in generate Remote Template function If there\'s no global variable
 name then we\'ll use default as default value for that parameter
  */
export const parseRemoteSyntax = (remote: any) => {
  if (typeof remote === 'string' && remote.includes('@')) {
    const [url, global] = extractUrlAndGlobal(remote);
    return generateRemoteTemplate(url, global);
  }

  return remote;
};

class NodeFederationPlugin {
  private _options: ModuleFederationPluginOptions;
  private context: Context;
  private experiments: NodeFederationOptions['experiments'];

  constructor(
    { experiments, verbose, ...options }: NodeFederationOptions,
    context: Context
  ) {
    this._options = options || ({} as ModuleFederationPluginOptions);
    this.context = context || ({} as Context);
    this.experiments = experiments || {};
  }

  apply(compiler: Compiler) {
    // When used with Next.js, context is needed to use Next.js webpack
    const { webpack } = compiler;

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
            ? `${uniqueName}.js`
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
