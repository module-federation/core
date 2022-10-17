'use strict';

import type { Compiler, container } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';

type EmptyObject = Record<string, unknown>;

interface NodeFederationOptions extends ModuleFederationPluginOptions {
  experiments?: Record<string, unknown>;
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

// Note on ESM.
// Its possible to use ESM import, but its impossible to invalidate the module cache
// So once something is imported, its stuck. This is problematic with at-runtime since we want to hot reload node
// if ESM were used, youd be forced to restart the process to re-import modules or use a worker pool
// Workaround is possible with query string on end of request, but this leaks memory badly
// with commonjs, we can at least reset the require cache to "reboot" webpack runtime
// It *can* leak memory, but ive not been able to replicate this to an extent that would be concerning.
// ESM WILL leak memory, big difference.
// Im talking with TC39 about a proposal around "virtual module trees" which would solve many problems.
// VMT is like Realms but better - easiest analogy would be like forking the main thread, without going off main thread
// VMT allows for scope isolation, but still allows reflection and non-primitive memory pointers to be shared - perfect for MFP

//TODO: should use extractUrlAndGlobal from internal.js
//TODO: should use Template system like LoadFileChunk runtime does.
//TODO: should use Template system like LoadFileChunk runtime does.
//TODO: global.webpackChunkLoad could use a better convention? I have to use a special http client to get out of my infra firewall
const executeLoadTemplate = `
    function executeLoad(remoteUrl, retry) {
      function extractUrlAndGlobal(urlAndGlobal) {
        var index = urlAndGlobal.indexOf("@");
        if (index <= 0 || index === urlAndGlobal.length - 1) {
                throw new Error("Invalid request " + urlAndGlobal);
        }
        return [urlAndGlobal.substring(index + 1), urlAndGlobal.substring(0, index)];
      }
      console.log('remoteUrl',remoteUrl)
        const [scriptUrl, moduleName] = extractUrlAndGlobal(remoteUrl);
        console.log("executing remote load", scriptUrl);
        const vm = require('vm');
        return new Promise(function (resolve, reject) {

         (global.webpackChunkLoad || global.fetch || require("node-fetch"))(scriptUrl).then(function(res){
            return res.text();
          }).then(function(scriptContent){
            try {
              const vmContext = { exports, require, module, global, __filename, __dirname, URL, ...global};
              const remote = vm.runInNewContext(scriptContent + '\\nmodule.exports', vmContext, { filename: 'node-federation-loader-' + moduleName + '.vm' });

              /* TODO: need something like a chunk loading queue, this can lead to async issues
               if two containers load the same remote, they can overwrite global scope
               should check someone is already loading remote and await that */
              global.__remote_scope__[moduleName] = remote[moduleName] || remote
              resolve(global.__remote_scope__[moduleName])
            } catch(e) {
              console.error('problem executing remote module', moduleName);
              reject(e);
            }
          }).catch((e)=>{
            console.error('failed to fetch remote', moduleName, scriptUrl);
            console.error(e);
            reject(null)
          })
        }).catch((e)=>{
          console.error('error',e);

          if(!retry) {
            return executeLoad(remoteUrl, true);
          }
          console.warn(moduleName,'is offline, returning fake remote')

          return {
            fake: true,
            get:(arg)=>{
              console.log('faking', arg,'module on', moduleName);

              return Promise.resolve(()=>{
              return ()=>null
              });
            },
            init:()=>{}
          }
        })
    }
`;

function buildRemotes(
  mfConf: ModuleFederationPluginOptions,
  webpack: Compiler['webpack']
) {
  return Object.entries(mfConf.remotes || {}).reduce(
    (acc, [name, config]) => {
      // if its already been converted into promise, dont do it again
      if (config.startsWith('promise ') || config.startsWith('external ')) {
        acc.buildTime[name] = config;
        return acc;
      }
      /*
        TODO: global remote scope object should go into webpack runtime as a runtime requirement
        this can be done by referencing my LoadFile, CommonJs plugins in this directory.
      */
      const [global, url] = config.split('@');
      const loadTemplate = `promise new Promise((resolve, reject)=>{
    if(!global.__remote_scope__) {
      // create a global scope for container, similar to how remotes are set on window in the browser
      global.__remote_scope__ = {
        _config: {},
      }
    }

    global.__remote_scope__._config[${JSON.stringify(
      global
    )}] = ${JSON.stringify(url)};

     var __webpack_error__ = new Error();
    if (typeof global.__remote_scope__[${JSON.stringify(global)}] !== 'undefined') return resolve(global.__remote_scope__[${JSON.stringify(global)}]);
    __webpack_require__.l(
      ${JSON.stringify(url)},
      function (event) {
        if (typeof global.__remote_scope__[${JSON.stringify(global)}] !== 'undefined') return resolve(global.__remote_scope__[${JSON.stringify(global)}]);
        var realSrc = event && event.target && event.target.src;
        __webpack_error__.message =
          'Loading script failed.\\n(' + event.message + ': ' + realSrc + ')';
        __webpack_error__.name = 'ScriptExternalLoadError';
        __webpack_error__.stack = event.stack;
        reject(__webpack_error__);
      },
      ${JSON.stringify(global)},
    );
    }).catch(()=>{
        console.warn(${JSON.stringify(global)},'is offline, returning fake remote')

          return {
            fake: true,
            get:(arg)=>{
              console.log('faking', arg,'module on', ${JSON.stringify(global)});

              return Promise.resolve(()=>{
              return ()=>null
              });
            },
            init:()=>{}
          }

    }).then(remote=>{
      if(remote.fake) {
        return remote;
      }


   const proxy =  {
      get: (arg)=>{
        if(!global.__remote_scope__[${JSON.stringify(global)}].__initialized) {
          try {
            global.__remote_scope__[${JSON.stringify(global)}].__initialized = true;
            proxy.init(__webpack_require__.S.default);
          } catch(e) {}
        }
        return remote.get(arg).then((f)=>{
          const m = f();
          return ()=>new Proxy(m, {
            get: (target, prop)=>{
            if(global.usedChunks) global.usedChunks.add(${JSON.stringify(global)} + "->" + arg);
              return target[prop];
            }
          })
        })
      },
        init: (args)=> {
        if(global.__remote_scope__[${JSON.stringify(global)}].__initialized) return Promise.resolve();
        global.__remote_scope__[${JSON.stringify(global)}].__initialized = true;
          return remote.init(new Proxy(args, {
            set: (target, prop, value)=>{
              if(global.usedChunks) global.usedChunks.add(${JSON.stringify(global)} + "->" + prop);
              target[prop] = value;
              return true;
            }
          }))
        }
    }

    return proxy;

  });
  `;
      acc.buildTime[name] = loadTemplate;
      return acc;
    },
    { runtime: {}, buildTime: {}, hot: {} } as {
      runtime: EmptyObject;
      buildTime: EmptyObject;
      hot: EmptyObject;
    }
  );
}

class NodeFederationPlugin {
  private options: ModuleFederationPluginOptions;
  private context: Context;
  private experiments: NodeFederationOptions['experiments'];

  constructor(
    { experiments, ...options }: NodeFederationOptions,
    context: Context
  ) {
    this.options = options || ({} as ModuleFederationPluginOptions);
    this.context = context || ({} as Context);
    this.experiments = experiments || {};
  }



  apply(compiler: Compiler) {
    // When used with Next.js, context is needed to use Next.js webpack
    const { webpack } = compiler;

    const { buildTime, runtime, hot } = buildRemotes(
      this.options,
      webpack || require('webpack')
    );
    const defs = {
      'process.env.REMOTES': runtime,
      'process.env.REMOTE_CONFIG': hot,
    };

    // new ((webpack && webpack.DefinePlugin) || require("webpack").DefinePlugin)(
    //     defs
    // ).apply(compiler);

    const pluginOptions = {
      ...this.options,
      remotes: buildTime as ModuleFederationPluginOptions['remotes'],
    };

    new (this.context.ModuleFederationPlugin ||
      (webpack && webpack.container.ModuleFederationPlugin) ||
      require('webpack/lib/container/ModuleFederationPlugin'))(
      pluginOptions
    ).apply(compiler);
  }
}

export default NodeFederationPlugin;
