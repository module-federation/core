//@ts-nocheck

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const {
  resolve,
  getExports,
  createEsBuildAdapter,
} = require('@module-federation/esbuild/esbuild-adapter');
const { federationBuilder } = require('@module-federation/esbuild/build');
const createContainerCode = `
import bundler_runtime_base from '@module-federation/webpack-bundler-runtime';
// import instantiatePatch from "./federation.js";

const createContainer = (federationOptions) => {
  // await instantiatePatch(federationOptions, true);
  const {exposes, name, remotes = [], shared, plugins} = federationOptions;

  const __webpack_modules__ = {
    "./node_modules/.federation/entry.1f2288102e035e2ed66b2efaf60ad043.js": (module, __webpack_exports__, __webpack_require__) => {
      __webpack_require__.r(__webpack_exports__);
      const bundler_runtime = __webpack_require__.n(bundler_runtime_base);
      const prevFederation = __webpack_require__.federation;
      __webpack_require__.federation = {};
      for (const key in bundler_runtime()) {
        __webpack_require__.federation[key] = bundler_runtime()[key];
      }
      for (const key in prevFederation) {
        __webpack_require__.federation[key] = prevFederation[key];
      }
      if (!__webpack_require__.federation.instance) {
        const pluginsToAdd = plugins || [];
        __webpack_require__.federation.initOptions.plugins = __webpack_require__.federation.initOptions.plugins ?
          __webpack_require__.federation.initOptions.plugins.concat(pluginsToAdd) : pluginsToAdd;
        __webpack_require__.federation.instance = __webpack_require__.federation.runtime.init(__webpack_require__.federation.initOptions);
        if (__webpack_require__.federation.attachShareScopeMap) {
          __webpack_require__.federation.attachShareScopeMap(__webpack_require__);
        }
        if (__webpack_require__.federation.installInitialConsumes) {
          __webpack_require__.federation.installInitialConsumes();
        }
      }
    },

    "webpack/container/entry/createContainer": (module, exports, __webpack_require__) => {
      const moduleMap = {};
      for (const key in exposes) {
        if (Object.prototype.hasOwnProperty.call(exposes, key)) {
          moduleMap[key] = () => Promise.resolve(exposes[key]()).then(m => () => m);
        }
      }
      const get = (module, getScope) => {
        __webpack_require__.R = getScope;
        getScope = (
          __webpack_require__.o(moduleMap, module)
            ? moduleMap[module]()
            : Promise.resolve().then(() => {
              throw new Error("Module '" + module + "' does not exist in container.");
            })
        );
        __webpack_require__.R = undefined;
        return getScope;
      };
      const init = (shareScope, initScope, remoteEntryInitOptions) => {
        return __webpack_require__.federation.bundlerRuntime.initContainerEntry({
          webpackRequire: __webpack_require__,
          shareScope: shareScope,
          initScope: initScope,
          remoteEntryInitOptions: remoteEntryInitOptions,
          shareScopeKey: "default"
        });
      };
      __webpack_require__("./node_modules/.federation/entry.1f2288102e035e2ed66b2efaf60ad043.js");

      // This exports getters to disallow modifications
      __webpack_require__.d(exports, {
        get: () => get,
        init: () => init,
        moduleMap: () => moduleMap,
      });
    }
  };

  const __webpack_module_cache__ = {};

  const __webpack_require__ = (moduleId) => {
    let cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    let module = __webpack_module_cache__[moduleId] = {
      id: moduleId,
      loaded: false,
      exports: {}
    };

    const execOptions = {
      id: moduleId,
      module: module,
      factory: __webpack_modules__[moduleId],
      require: __webpack_require__
    };
    __webpack_require__.i.forEach(handler => {
      handler(execOptions);
    });
    module = execOptions.module;
    execOptions.factory.call(module.exports, module, module.exports, execOptions.require);

    module.loaded = true;

    return module.exports;
  };

  __webpack_require__.m = __webpack_modules__;
  __webpack_require__.c = __webpack_module_cache__;
  __webpack_require__.i = [];

  if (!__webpack_require__.federation) {
    __webpack_require__.federation = {
      initOptions: {
        "name": name,
        "remotes": remotes.map(remote => ({
          "type": remote.type,
          "alias": remote.alias,
          "name": remote.name,
          "entry": remote.entry,
          "shareScope": remote.shareScope || "default"
        }))
      },
      chunkMatcher: () => true,
      rootOutputDir: "",
      initialConsumes: undefined,
      bundlerRuntimeOptions: {}
    };
  }

  __webpack_require__.n = (module) => {
    const getter = module && module.__esModule ? () => module['default'] : () => module;
    __webpack_require__.d(getter, {a: getter});
    return getter;
  };

  __webpack_require__.d = (exports, definition) => {
    for (const key in definition) {
      if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
        Object.defineProperty(exports, key, {enumerable: true, get: definition[key]});
      }
    }
  };

  __webpack_require__.f = {};

  __webpack_require__.g = (() => {
    if (typeof globalThis === 'object') return globalThis;
    try {
      return this || new Function('return this')();
    } catch (e) {
      if (typeof window === 'object') return window;
    }
  })();

  __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

  __webpack_require__.r = (exports) => {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, {value: 'Module'});
    }
    Object.defineProperty(exports, '__esModule', {value: true});
  };

  __webpack_require__.federation.initOptions.shared = shared;
  __webpack_require__.S = {};
  const initPromises = {};
  const initTokens = {};
  __webpack_require__.I = (name, initScope) => {
    return __webpack_require__.federation.bundlerRuntime.I({
      shareScopeName: name,
      webpackRequire: __webpack_require__,
      initPromises: initPromises,
      initTokens: initTokens,
      initScope: initScope,
    });
  };

  const __webpack_exports__ = __webpack_require__("webpack/container/entry/createContainer");
  const __webpack_exports__get = __webpack_exports__.get;
  const __webpack_exports__init = __webpack_exports__.init;
  return __webpack_exports__;
}`;

function createVirtualModuleShare(name, ref, exports) {
  const code = `
// find this FederationHost instance.
console.log(__FEDERATION__.__INSTANCES__[0],${JSON.stringify(
    name,
  )}, ${JSON.stringify(ref)})

// Each virtual module needs to know what FederationHost to connect to for loading modules
const container = __FEDERATION__.__INSTANCES__.find(container=>{
  return container.name === ${JSON.stringify(name)}
}) || __FEDERATION__.__INSTANCES__[0]

// Federation Runtime takes care of script injection
const mfLsZJ92 = await container.loadShare(${JSON.stringify(ref)})

${exports
  .map((e) => {
    if (e === 'default') return `export default mfLsZJ92.default`;
    return `export const ${e} = mfLsZJ92[${JSON.stringify(e)}];`;
  })
  .join('\n')}
`;
  return code;
}

const virtualModule = (options = {}) => {
  const namespace = 'virtual';
  const filter = new RegExp(
    Object.keys(options)
      .map((name) => `^${name}$`)
      .join('|'),
  );
  return {
    name: namespace,
    setup(build) {
      build.onResolve({ filter }, (args) => ({ path: args.path, namespace }));
      build.onLoad({ filter: /.*/, namespace }, (args) => ({
        contents: options[args.path],
        loader: 'js',
      }));
    },
  };
};

const buildFederationHost = (outputPath) => {
  const { name, remotes, shared } = federationBuilder.config;

  const remoteConfigs = remotes
    ? JSON.stringify(
        Object.entries(remotes).map(([remoteAlias, remote]) => ({
          name: remoteAlias,
          entry: remote,
          alias: remoteAlias,
          type: 'esm',
        })),
      )
    : '[]';

  const shareConfig =
    Object.entries(shared).reduce((acc, [pkg, config]) => {
      const version = config.requiredVersion?.replace(/^[^0-9]/, '') || '';

      // const referencedChunk = federationBuilder.federationInfo.shared.find((chunk)=>{
      //  return chunk.packageName === pkg
      // })

      // const relPath = path.resolve(outputPath,'mf_' + referencedChunk.outFileName)
      // debugger;

      acc += `${JSON.stringify(pkg)}: {
        "package": "${pkg}",
        "version": "${version}",
        "scope": "default",
        "get": async () => await import('federationShare/${pkg}'),
        "shareConfig": {
          "singleton": ${config.singleton},
          "requiredVersion": "${config.requiredVersion}",
          "eager": ${config.eager},
          "strictVersion": ${config.strictVersion}
        }
      },\n`;

      return acc;
    }, '{') + '}';

  const injectedContent = `
    import { init as initFederationHost } from "@module-federation/runtime";
// await new Promise(()=>setTimeout(resolve), 1000)
    initFederationHost({
      name: ${JSON.stringify(name)},
      remotes: ${remoteConfigs},
      shared: ${shareConfig}
     });
  `;

  return injectedContent;
};

const buildContainerHost = (outputPath) => {
  const {
    name,
    remotes = {},
    shared = {},
    exposes = {},
  } = federationBuilder.config;

  const remoteConfigs = remotes
    ? Object.entries(remotes).map(([remoteAlias, remote]) => ({
        type: 'esm',
        name: remoteAlias,
        entry: remote.entry,
        alias: remoteAlias,
      }))
    : [];

  const shareConfig =
    Object.entries(shared).reduce((acc, [pkg, config]) => {
      const version = config.requiredVersion?.replace(/^[^0-9]/, '') || '';

      // const referencedChunk = federationBuilder.federationInfo.shared.find((chunk)=>{
      //  return chunk.packageName === pkg
      // })

      // const relPath = path.resolve(outputPath,'mf_' + referencedChunk.outFileName)

      acc += `${JSON.stringify(pkg)}: {
        "package": "${pkg}",
        "version": "${version}",
        "scope": "default",
        "get": async () => await import('${pkg}'),
        "shareConfig": {
          "singleton": ${config.singleton},
          "requiredVersion": "${config.requiredVersion}",
          "eager": ${config.eager},
          "strictVersion": ${config.strictVersion}
        }
      },\n`;

      return acc;
    }, '{') + '}';

  const exposesConfig = Object.entries(exposes).reduce(
    (acc, [exposeName, exposePath]) => {
      acc[`./${exposeName}`] = `()=> import('${exposePath}')`;
      return acc;
    },
    {},
  );

  const injectedContent = `
    const createdContainer = createContainer({
      name: ${JSON.stringify(name)},
      exposes: ${JSON.stringify(exposesConfig)},
      remotes: ${JSON.stringify(remoteConfigs)},
      shared: ${shareConfig},
    });
  `;
  return [createContainerCode, injectedContent].join('\n');
};

async function buildProject(projectName, watch) {
  const tsConfig = 'tsconfig.json';
  const outputPath = `dist/${projectName}`;
  /*
   *  Step 1: Initialize Native Federation
   */

  await federationBuilder.init({
    options: {
      workspaceRoot: path.join(__dirname, '..'),
      outputPath,
      tsConfig,
      federationConfig: `${projectName}/federation.config.js`,
      verbose: false,
      watch,
    },

    /*
     * As this core lib is tooling-agnostic, you
     * need a simple adapter for your bundler.
     * It's just a matter of one function.
     */
    adapter: createEsBuildAdapter({
      plugins: [
        virtualModule({
          federationHost: `export default 'na na na na na';`,
          robin: `export const robin = 'batmannnnn';`,
        }),
        // {
        //   name: 'createContainer',
        //   setup(build) {
        //
        //     // build.onResolve({ filter: /.+/ }, args => {
        //     //   return {
        //     //     path: args.path,
        //     //     namespace: 'file'
        //     //   };
        //     // });
        //
        //     const remoteEntryFilter = /remoteEntry.js$/;
        //     const jsAndMjsFilter = /.*\.(js|mjs)$/;
        //     const resolvedRuntime = require.resolve("@module-federation/webpack-bundler-runtime", {paths: [path.join(__dirname, '..')]})
        //     build.onResolve({ filter: /@module-federation\/webpack-bundler-runtime/ }, args => {
        //
        //       return ({
        //         path: resolvedRuntime.replace('cjs','esm'),
        //       })
        //     })
        //
        //
        //     // namespace to reserve them for this plugin.
        //     build.onResolve({ filter: /remoteEntry.js$/ }, args => {
        //       return ({
        //         path: args.path,
        //         namespace: 'container',
        //       })
        //     })
        //
        //
        //
        //     build.onLoad({ filter: /.+/, namespace:'container'}, async (args) => {
        //
        //
        //       const { name, remotes, shared } = federationBuilder.config;
        //
        //       const options = build.initialOptions
        //       const isEntryPoint =options.entryPoints.some(e=>args.path.includes( e))
        //
        //       const contents = await fs.promises.readFile(args.path, 'utf8');
        //
        //       const injectedContent = buildContainerHost(outputPath) + contents;
        //       // debugger
        //       return { contents: injectedContent};
        //     });
        //
        //     // build.onLoad({ filter: jsAndMjsFilter, namespace:'file' }, async (args) => {
        //     //
        //     //
        //     //   const options = build.initialOptions
        //     //   const isEntryPoint = options.entryPoints.some(e=>args.path.includes(e))
        //     //   const contents = await fs.promises.readFile(args.path, 'utf8');
        //     //
        //     //   if(!isEntryPoint) return { contents };
        //     //   // const contents = await fs.promises.readFile(args.path, 'utf8');
        //     //   // return {contents: contents}
        //     //
        //     //   const injectedContent = buildFederationHost(outputPath) + contents;
        //     //
        //     //   debugger;
        //     //
        //     //   return { contents: injectedContent };
        //     // });
        //
        //   }
        // }
      ],
    }),
  });

  /*
   *  Step 2: Trigger your build process
   *
   *      You can use any tool for this. Here, we go with a very
   *      simple esbuild-based build.
   *
   *      Just respect the externals in `federationBuilder.externals`.
   */

  const esmResolve = (await import('./resolve/esm-resolver.mjs')).default;
  fs.rmSync(outputPath, { force: true, recursive: true });

  await federationBuilder.build();
  const federationInfo = federationBuilder.federationInfo;

  await esbuild.build({
    entryPoints: [`${projectName}/main.ts`],
    external: federationBuilder.externals,
    outdir: outputPath,
    bundle: true,
    platform: 'browser',
    format: 'esm',
    mainFields: ['es2020', 'browser', 'module', 'main'],
    conditions: ['es2020', 'es2015', 'module'],
    resolveExtensions: ['.ts', '.tsx', '.mjs', '.js'],
    tsconfig: tsConfig,
    splitting: true,
    plugins: [
      {
        name: 'inject-top',
        setup(build) {
          const sharedExternals = new RegExp(
            '^' + federationBuilder.externals.join('|'),
          );

          //           build.onResolve({ filter:ext}, (args) => {
          //             console.log(args)
          //             if(args.path.endsWith("?federation")) {
          //               const path = esmResolve(args.path.replace('?federation', ''))
          //
          //               return {
          //                 path: path,
          //                 namespace: 'provide-shared-module'
          //               }
          //             }
          // const resolver =  esmResolve(args.path,{path:args.resolveDir});
          //
          //              return {
          //               path: resolver,
          //               namespace: 'file'
          //             };
          //           });

          // build.onResolve({ filter: sharedExternals }, (args) => {
          //
          //   if(args.namespace === 'federation-host') return null
          //   return {path: args.path, namespace: 'virtual-share-module', pluginData: {kind: args.kind, resolveDir: args.resolveDir}}
          // });

          build.onResolve({ filter: new RegExp('federation-host') }, (args) => {
            return {
              path: args.path,
              namespace: 'federation-host',
              pluginData: { kind: args.kind, resolveDir: args.resolveDir },
            };
          });
          //
          // // build.onResolve({filter: new RegExp('react$')},(args)=>{
          // //   return {path: args.path, namespace: 'federation-host', pluginData: {kind: args.kind, resolveDir: args.resolveDir}}
          // // })
          //
          //
          build.onLoad(
            { filter: /.*/, namespace: 'federation-host' },
            async (args) => {
              const injectedContent = buildFederationHost(outputPath);

              return {
                contents: injectedContent,
                resolveDir: args.pluginData.resolveDir,
              };
            },
          );

          build.onLoad({ filter: /.*\.(ts|js|mjs)$/ }, async (args) => {
            const options = build.initialOptions;
            const isEntryPoint = options.entryPoints.some((e) =>
              args.path.includes(e),
            );

            if (!isEntryPoint) return undefined;
            const contents = await fs.promises.readFile(args.path, 'utf8');

            // const injectedContent = 'import "federation-host"; \n' + contents;
            const injectedContent = buildFederationHost(outputPath) + contents;

            return { contents: injectedContent };
          });
        },
      },
      {
        name: 'createContainer',
        setup(build) {
          const externals = federationBuilder.externals;

          // build.onResolve({ filter: /.+/ }, args => {
          //   return {
          //     path: args.path,
          //     namespace: 'file'
          //   };
          // });

          const filter = new RegExp(
            ['remoteEntry'].map((name) => `${name}$`).join('|'),
          );

          const sharedExternals = new RegExp(
            externals.map((name) => `${name}$`).join('|'),
          );

          build.onResolve({ filter: filter }, async (args) => {
            return {
              path: args.path,
              namespace: 'container',
              pluginData: { kind: args.kind, resolveDir: args.resolveDir },
            };
          });

          const realShares = new RegExp(
            ['federationShare'].map((name) => `^${name}`).join('|'),
          );

          build.onResolve({ filter: realShares }, async (args) => {
            return {
              path: args.path.replace('federationShare/', ''),
              namespace: 'esm-shares',
              pluginData: { kind: args.kind, resolveDir: args.resolveDir },
            };
          });

          // can be removed and externals will work normally
          build.onResolve({ filter: sharedExternals }, (args) => {
            if (args.namespace === 'esm-shares') return null;

            return {
              path: args.path,
              namespace: 'virtual-share-module',
              pluginData: { kind: args.kind, resolveDir: args.resolveDir },
            };
            return null;
            // return {path: args.path, namespace: 'esm-shares', pluginData: {kind: args.kind, resolveDir: args.resolveDir}}
          });

          build.onResolve({ filter: /.*/, namespace: 'esm-shares' }, (args) => {
            const shouldExternalize = sharedExternals.test(args.path);
            if (shouldExternalize) {
              // use build module factory
              return {
                path: args.path,
                namespace: 'virtual-share-module',
                pluginData: { kind: args.kind, resolveDir: args.resolveDir },
              };
              // use external and depend on import map to factorize
              return { path: args.path, external: true };
            }
            return {
              path: args.path,
              namespace: 'esm-shares',
              pluginData: { kind: args.kind, resolveDir: args.resolveDir },
            };
          });

          //
          // build.onResolve({ filter: sharedExternals }, async (args) => {
          //   if(args.namespace === 'container') return undefined
          //    if(args.kind === 'require-call') {
          //      return {path: args.path, namespace: 'esm-shares', pluginData: {kind: args.kind, resolveDir: args.resolveDir}}
          //    }
          //   return {path: args.path, namespace: 'virtual-share-module', pluginData: {kind: args.kind, resolveDir: args.resolveDir}}
          // });

          // const resolvedRuntime = require.resolve("@module-federation/webpack-bundler-runtime", {paths: [path.join(__dirname, '..')]})
          // build.onResolve({ filter: /@module-federation\/webpack-bundler-runtime/ }, args => {
          //
          //   return ({
          //     path: resolvedRuntime.replace('cjs','esm'),
          //   })
          // })

          build.onLoad({ filter, namespace: 'container' }, async (args) => {
            const code = [
              buildContainerHost(fedOptions.outputPath, config),
            ].join('\n');
            return {
              contents: code,
              loader: 'js',
              resolveDir: args.pluginData.resolveDir,
            };
          });

          // build.onLoad({ filter: jsAndMjsFilter, namespace:'file' }, async (args) => {
          //
          //
          //   const options = build.initialOptions
          //   const isEntryPoint = options.entryPoints.some(e=>args.path.includes(e))
          //   const contents = await fs.promises.readFile(args.path, 'utf8');
          //
          //   if(!isEntryPoint) return { contents };
          //   // const contents = await fs.promises.readFile(args.path, 'utf8');
          //   // return {contents: contents}
          //
          //   const injectedContent = buildFederationHost(outputPath) + contents;
          //
          //   debugger;
          //
          //   return { contents: injectedContent };
          // });
        },
      },
      {
        name: 'cjs-to-esm',
        setup(build) {
          const externals = federationBuilder.externals;

          const filter = new RegExp(
            externals.map((name) => `${name}$`).join('|'),
          );

          //
          // build.onResolve({ filter: filter, namespace: 'file' }, async (args) => {
          //   return {path: args.path, namespace: 'esm-shares', pluginData: {kind: args.kind, resolveDir: args.resolveDir}}
          // });

          build.onLoad(
            { filter: /.*/, namespace: 'esm-shares' },
            async (args) => {
              const { transform } = await eval("import('@chialab/cjs-to-esm')");
              // const resolver = await build.resolve(args.path.replace('federationShare/','') + "?", {resolveDir: args.resolveDir, kind: args.kind, namespace: 'esm-shares'})
              const resolver = await resolve(
                args.pluginData.resolveDir,
                args.path,
              );

              const fileContent = fs.readFileSync(resolver, 'utf-8');
              const { code, map } = await transform(fileContent);

              const o = {
                contents: code,
                loader: 'js',
                resolveDir: path.dirname(resolver),
                pluginData: { ...args.pluginData, path: resolver.path },
              };
              return o;
            },
          );
        },
      },
      {
        name: 'linkShared',
        setup(build) {
          const externals = federationBuilder.externals;

          const filter = new RegExp(
            externals.map((name) => `${name}$`).join('|'),
          );

          // build.onResolve({ filter: filter, namespace: 'file' }, async (args) => {
          //   return {path: args.path, namespace: 'cjs-to-esm', pluginData: {kind: args.kind, resolveDir: args.resolveDir}}
          // });

          // build.onResolve({ filter: filter}, async (args) => {
          //   return {path: args.path, namespace: 'virtual-share-module', pluginData: {kind: args.kind, resolveDir: args.resolveDir}}
          // });

          build.onLoad(
            { filter, namespace: 'virtual-share-module' },
            async (args) => {
              const exp = await getExports(args.path);
              const virtualShare = createVirtualModuleShare(
                federationBuilder.config.name,
                args.path,
                exp,
              );
              return {
                contents: virtualShare,
                loader: 'js',
                resolveDir: path.dirname(args.path),
              };
            },
          );

          //           build.onLoad({filter, namespace: 'container'}, async(args)=>{
          //
          //             const resolver = await build.resolve(args.path, {kind: 'import-statement', resolveDir: args.pluginData.resolveDir});
          //             debugger;
          //             const fileContent = fs.readFileSync(resolver.path,'utf-8')
          // debugger;
          //             const exp =   await getExports(args.path)
          //             console.log(exp)
          //             const virtualShare = createVirtualModuleShare(args.path, config.name, exp);
          //             return {contents: virtualShare, loader: 'js'}
          //           })

          // const resolvedRuntime = require.resolve("@module-federation/webpack-bundler-runtime", {paths: [path.join(__dirname, '..')]})
          // build.onResolve({ filter: /@module-federation\/webpack-bundler-runtime/ }, args => {
          //
          //   return ({
          //     path: resolvedRuntime.replace('cjs','esm'),
          //   })
          // })

          //
          //  build.onLoad({ filter, namespace:'container'}, async (args) => {
          //
          //    const code = [buildContainerHost(fedOptions.outputPath, config)].join('\n')
          //
          // return {contents: code, loader: 'js'}
          //    // const { name, remotes, shared } = federationBuilder.config;
          //    //
          //    // const options = build.initialOptions
          //    // const isEntryPoint =options.entryPoints.some(e=>args.path.includes( e))
          //    //
          //    // const contents = await fs.promises.readFile(args.path, 'utf8');
          //    //
          //    // const injectedContent = buildContainerHost(outputPath) + contents;
          //    // // debugger
          //    // return { contents: injectedContent};
          //  });

          // build.onLoad({ filter: jsAndMjsFilter, namespace:'file' }, async (args) => {
          //
          //
          //   const options = build.initialOptions
          //   const isEntryPoint = options.entryPoints.some(e=>args.path.includes(e))
          //   const contents = await fs.promises.readFile(args.path, 'utf8');
          //
          //   if(!isEntryPoint) return { contents };
          //   // const contents = await fs.promises.readFile(args.path, 'utf8');
          //   // return {contents: contents}
          //
          //   const injectedContent = buildFederationHost(outputPath) + contents;
          //
          //   debugger;
          //
          //   return { contents: injectedContent };
          // });
        },
      },
    ],
    watch,
  });

  fs.copyFileSync(
    `${projectName}/index.html`,
    `dist/${projectName}/index.html`,
  );
  fs.copyFileSync(
    `${projectName}/favicon.ico`,
    `dist/${projectName}/favicon.ico`,
  );
  fs.copyFileSync(
    `${projectName}/styles.css`,
    `dist/${projectName}/styles.css`,
  );

  /*
   *  Step 3: Let the build method do the additional tasks
   *       for supporting Native Federation
   */

  // await federationBuilder.build();
}

module.exports = { buildProject };
