'use strict';

import type { Compiler, container } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';

type EmptyObject = Record<string, unknown>;

interface StreamingFederationOptions extends ModuleFederationPluginOptions {
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
    function executeLoad(remoteUrl) {
    console.log('remoteUrl',remoteUrl)
        const extractUrlAndGlobal = require('webpack/lib/util/extractUrlAndGlobal');
        const [scriptUrl, moduleName] = extractUrlAndGlobal(remoteUrl);
        console.log("executing remote load", scriptUrl);
        const vm = require('vm');
        return new Promise(function (resolve, reject) {

         (global.webpackChunkLoad || global.fetch || require("node-fetch"))(scriptUrl).then(function(res){
            return res.text();
          }).then(function(scriptContent){
            try {
              const vmContext = { exports, require, module, global, __filename, __dirname, URL };

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
          console.warn(moduleName,'is offline, returning fake remote')
          return {
            fake: true,
            get:(arg)=>{
              console.log('faking', arg,'module on', moduleName);

              return ()=> Promise.resolve();
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
      const loadTemplate = `promise new Promise((resolve)=>{
    if(!global.__remote_scope__) {
      // create a global scope for container, similar to how remotes are set on window in the browser
      global.__remote_scope__ = {
        _config: {},
      }
    }

    global.__remote_scope__._config[${JSON.stringify(
      global
    )}] = ${JSON.stringify(url)};

    ${executeLoadTemplate}
    resolve(executeLoad(${JSON.stringify(config)}))
    }).then(remote=>{
      console.log(remote);

      return {
      get: remote.get,
      init: (args)=> {
        console.log(args)
        return remote.init(args)
      }
    }
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

  //old design
  return Object.entries(mfConf.remotes || {}).reduce(
    (acc, [name, config]) => {
      const hasMiddleware = config.startsWith('middleware ');
      let middleware;
      if (hasMiddleware) {
        middleware = config.split('middleware ')[1];
      } else {
        middleware = `Promise.resolve(${JSON.stringify(config)})`;
      }

      const templateStart = `
              var ${webpack.RuntimeGlobals.require} = ${
        webpack.RuntimeGlobals.require
      } ? ${
        webpack.RuntimeGlobals.require
      } : typeof arguments !== 'undefined' ? arguments[2] : false;
               ${executeLoadTemplate}
        global.loadedRemotes = global.loadedRemotes || {};
        if (global.loadedRemotes[${JSON.stringify(name)}]) {
          return global.loadedRemotes[${JSON.stringify(name)}]
        }
        // if using modern output, then there are no arguments on the parent function scope, thus we need to get it via a window global.

      var shareScope = (${webpack.RuntimeGlobals.require} && ${
        webpack.RuntimeGlobals.shareScopeMap
      }) ? ${
        webpack.RuntimeGlobals.shareScopeMap
      } : global.__webpack_share_scopes__
      var name = ${JSON.stringify(name)}
      `;
      const template = `(remotesConfig) => new Promise((res) => {
      console.log('in template promise',JSON.stringify(remotesConfig))
        executeLoad(remotesConfig).then((remote) => {

          return Promise.resolve(remote.init(shareScope.default)).then(() => {
            return remote
          })
        })
          .then(function (remote) {
            const proxy = {
              get: remote.get,
              chunkMap: remote.chunkMap,
              path: remotesConfig.toString(),
              init: (arg) => {
                try {
                  return remote.init(shareScope.default)
                } catch (e) {
                  console.log('remote container already initialized')
                }
              }
            }
            if (remote.fake) {
              res(proxy);
              return null
            }

            Object.assign(global.loadedRemotes, {
              [name]: proxy
            });

            res(global.loadedRemotes[name])
          })


      })`;

      acc.runtime[name] = `()=> ${middleware}.then((remoteConfig)=>{
    console.log('remoteConfig runtime',remoteConfig);
    if(!global.REMOTE_CONFIG) {
        global.REMOTE_CONFIG = {};
    }
    global.REMOTE_CONFIG[${JSON.stringify(name)}] = remoteConfig;
    ${templateStart}
    const loadTemplate = ${template};
    return loadTemplate(remoteConfig)
    })`;

      acc.buildTime[name] = `promise ${middleware}.then((remoteConfig)=>{
            if(!global.REMOTE_CONFIG) {
        global.REMOTE_CONFIG = {};
    }
    console.log('remoteConfig buildtime',remoteConfig);
    global.REMOTE_CONFIG[${JSON.stringify(name)}] = remoteConfig;
    ${templateStart};
    const loadTemplate = ${template};
    return loadTemplate(remoteConfig)
    })`;

      acc.hot[name] = `()=> ${middleware}`;

      return acc;
    },
    { runtime: {}, buildTime: {}, hot: {} } as {
      runtime: EmptyObject;
      buildTime: EmptyObject;
      hot: EmptyObject;
    }
  );
}

class StreamingTargetPlugin {
  private options: ModuleFederationPluginOptions;
  private context: Context;
  private experiments: StreamingFederationOptions['experiments'];

  constructor(
    { experiments, ...options }: StreamingFederationOptions,
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

export default StreamingTargetPlugin;
