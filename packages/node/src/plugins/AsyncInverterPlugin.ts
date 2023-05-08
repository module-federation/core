import type { Chunk, Compiler, Compilation } from 'webpack';
import Template from 'webpack/lib/Template';
import type { ModuleFederationPluginOptions } from '../types';
import { ConcatSource, RawSource, ReplaceSource } from 'webpack-sources';
import RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import StartupChunkDependenciesPlugin from 'webpack/lib/runtime/StartupChunkDependenciesPlugin';
import template from './custom-jsonp';
import ChunkLoadingRuntimeModule from './LoadFileChunkLoadingRuntimeModule';
import { ChunkGraph, Module, RuntimeModule } from 'webpack';
//@ts-ignore
import {
  parseVersionRuntimeCode,
  versionLtRuntimeCode,
  rangeToStringRuntimeCode,
  satisfyRuntimeCode,
  //@ts-ignore
} from 'webpack/lib/util/semver';
interface CommonJsChunkLoadingOptions extends ModuleFederationPluginOptions {
  baseURI: Compiler['options']['output']['publicPath'];
  promiseBaseURI?: string;
  remotes: Record<string, string>;
  name?: string;
  asyncChunkLoading: boolean;
  verbose?: boolean;
  invertedBoot?: boolean;
}

class AsyncInverterPlugin {
  private options: CommonJsChunkLoadingOptions;
  private initialRemoteModules: Map<any, any>;
  // @ts-ignore
  private compiler: Compiler;

  constructor(options: CommonJsChunkLoadingOptions) {
    this.options = options || ({} as CommonJsChunkLoadingOptions);
    // eager imports of remote container modules
    this.initialRemoteModules = new Map();
  }

  getInitialChunkIds(chunk: Chunk, chunkGraph: ChunkGraph) {
    const chunkHasJs =
      (this.compiler.webpack &&
        this.compiler.webpack.javascript.JavascriptModulesPlugin.chunkHasJs) ||
      // @ts-ignore
      require('webpack/lib/javascript/JavascriptModulesPlugin').chunkHasJs;
    //@ts-ignore
    const initialChunkIds = new Set(`${chunk.id}` || [chunk.ids]);
    let cc;
    let current;
    for (const c of chunk.getAllInitialChunks()) {
      console.log('looping through initial chunks', c);
      if (c === chunk || chunkHasJs(c, chunkGraph)) continue;
      if (c.ids) {
        for (const id of c.ids) initialChunkIds.add(`${id}`);
      }
      current = c;
      cc = c.getAllInitialChunks();
    }

    return initialChunkIds;
  }
  mapShared(compilation: Compilation) {
    const { runtimeTemplate, chunkGraph, codeGenerationResults } = compilation;
    const chunkToModuleMapping = {};
    /** @type {Map<string | number, Source>} */
    const moduleIdToSourceMapping = new Map();
    const moduleIdToSourceChunkID = new Map();
    // @ts-ignore
    const initialConsumes = [];

    /**
     *
     * @param {Iterable<Module>} modules modules
     * @param {Chunk} chunk the chunk
     * @param {(string | number)[]} list list of ids
     */
    //@ts-ignore
    const addShared = (modules, chunk, list) => {
      for (const m of modules) {
        const module = /** @type {ConsumeSharedModule} */ m;
        const id = chunkGraph.getModuleId(module);
        list.push(id);
        moduleIdToSourceMapping.set(
          id,
          codeGenerationResults.getSource(
            module,
            chunk.runtime,
            'consume-shared'
          )
        );
      }
    };
    // @ts-ignore
    const addModules = (modules, chunk, list) => {
      for (const m of modules) {
        const module = /** @type {ConsumeSharedModule} */ m;
        const id = chunkGraph.getModuleId(module);
        list.push(id);
        const moduleOrigin = module.options.importResolved;
        const filter = chunkGraph.getChunkModuleIdMap(
          chunk,
          (module) => {
            // @ts-ignore
            return module?.resource === moduleOrigin;
          },
          true
        );

        moduleIdToSourceChunkID.set(id, filter);
      }
    };

    for (const entrypointModule of compilation.entrypoints.values()) {
      const entrypoint = entrypointModule.getEntrypointChunk();
      if (entrypoint.hasRuntime()) continue;

      // for (const entryChunks of entrypoint.getAllInitialChunks()) {}
      // @ts-ignore
      for (const chunk of entrypoint.getAllAsyncChunks()) {
        const modules = chunkGraph.getChunkModulesIterableBySourceType(
          chunk,
          'consume-shared'
        );
        if (!modules) continue;

        //@ts-ignore
        //  addModules(modules, chunk, (chunkToModuleMapping[chunk.id] = []));
      }
      // @ts-ignore
      for (const chunk of entrypoint.getAllInitialChunks()) {
        const modules = chunkGraph.getChunkModulesIterableBySourceType(
          chunk,
          'consume-shared'
        );
        if (!modules) continue;
        // @ts-ignore
        addModules(modules, chunk, (chunkToModuleMapping[chunk.id] = []));
        //@ts-ignore
        addShared(modules, chunk, initialConsumes);
      }
    }

    if (
      moduleIdToSourceMapping.size === 0 ||
      moduleIdToSourceChunkID.size === 0
    )
      return null;

    return Template.asString([
      parseVersionRuntimeCode(runtimeTemplate),
      versionLtRuntimeCode(runtimeTemplate),
      rangeToStringRuntimeCode(runtimeTemplate),
      satisfyRuntimeCode(runtimeTemplate),
      `var ensureExistence = ${runtimeTemplate.basicFunction('scopeName, key', [
        `var scope = ${RuntimeGlobals.shareScopeMap}[scopeName];`,
        `if(!scope || !${RuntimeGlobals.hasOwnProperty}(scope, key)) throw new Error("Shared module " + key + " doesn't exist in shared scope " + scopeName);`,
        'return scope;',
      ])};`,
      `var findVersion = ${runtimeTemplate.basicFunction('scope, key', [
        'var versions = scope[key];',
        `var key = Object.keys(versions).reduce(${runtimeTemplate.basicFunction(
          'a, b',
          ['return !a || versionLt(a, b) ? b : a;']
        )}, 0);`,
        'return key && versions[key]',
      ])};`,
      `var findSingletonVersionKey = ${runtimeTemplate.basicFunction(
        'scope, key',
        [
          'var versions = scope[key];',
          `return Object.keys(versions).reduce(${runtimeTemplate.basicFunction(
            'a, b',
            ['return !a || (!versions[a].loaded && versionLt(a, b)) ? b : a;']
          )}, 0);`,
        ]
      )};`,
      `var getInvalidSingletonVersionMessage = ${runtimeTemplate.basicFunction(
        'scope, key, version, requiredVersion',
        [
          `return "Unsatisfied version " + version + " from " + (version && scope[key][version].from) + " of shared singleton module " + key + " (required " + rangeToString(requiredVersion) + ")"`,
        ]
      )};`,
      `var getSingleton = ${runtimeTemplate.basicFunction(
        'scope, scopeName, key, requiredVersion',
        [
          'var version = findSingletonVersionKey(scope, key);',
          'return get(scope[key][version]);',
        ]
      )};`,
      `var getSingletonVersion = ${runtimeTemplate.basicFunction(
        'scope, scopeName, key, requiredVersion',
        [
          'var version = findSingletonVersionKey(scope, key);',
          'if (!satisfy(requiredVersion, version)) ' +
            'typeof console !== "undefined" && console.warn && console.warn(getInvalidSingletonVersionMessage(scope, key, version, requiredVersion));',
          'return get(scope[key][version]);',
        ]
      )};`,
      `var getStrictSingletonVersion = ${runtimeTemplate.basicFunction(
        'scope, scopeName, key, requiredVersion',
        [
          'var version = findSingletonVersionKey(scope, key);',
          'if (!satisfy(requiredVersion, version)) ' +
            'throw new Error(getInvalidSingletonVersionMessage(scope, key, version, requiredVersion));',
          'return get(scope[key][version]);',
        ]
      )};`,
      `var findValidVersion = ${runtimeTemplate.basicFunction(
        'scope, key, requiredVersion',
        [
          'var versions = scope[key];',
          `var key = Object.keys(versions).reduce(${runtimeTemplate.basicFunction(
            'a, b',
            [
              'if (!satisfy(requiredVersion, b)) return a;',
              'return !a || versionLt(a, b) ? b : a;',
            ]
          )}, 0);`,
          'return key && versions[key]',
        ]
      )};`,
      `var getInvalidVersionMessage = ${runtimeTemplate.basicFunction(
        'scope, scopeName, key, requiredVersion',
        [
          'var versions = scope[key];',
          'return "No satisfying version (" + rangeToString(requiredVersion) + ") of shared module " + key + " found in shared scope " + scopeName + ".\\n" +',
          `"Available versions: " + Object.keys(versions).map(${runtimeTemplate.basicFunction(
            'key',
            ['return key + " from " + versions[key].from;']
          )}).join(", ");`,
        ]
      )};`,
      `var getValidVersion = ${runtimeTemplate.basicFunction(
        'scope, scopeName, key, requiredVersion',
        [
          'var entry = findValidVersion(scope, key, requiredVersion);',
          'if(entry) return get(entry);',
          'throw new Error(getInvalidVersionMessage(scope, scopeName, key, requiredVersion));',
        ]
      )};`,
      `var warnInvalidVersion = ${runtimeTemplate.basicFunction(
        'scope, scopeName, key, requiredVersion',
        [
          'typeof console !== "undefined" && console.warn && console.warn(getInvalidVersionMessage(scope, scopeName, key, requiredVersion));',
        ]
      )};`,
      `var get = ${runtimeTemplate.basicFunction('entry', [
        'entry.loaded = 1;',
        'return entry.get()',
      ])};`,
      `var init = ${runtimeTemplate.returningFunction(
        Template.asString([
          'function(scopeName, a, b, c) {',
          Template.indent([
            `var promise = ${RuntimeGlobals.initializeSharing}(scopeName);`,
            `if (promise && promise.then) return promise.then(fn.bind(fn, scopeName, ${RuntimeGlobals.shareScopeMap}[scopeName], a, b, c));`,
            `return fn(scopeName, ${RuntimeGlobals.shareScopeMap}[scopeName], a, b, c);`,
          ]),
          '}',
        ]),
        'fn'
      )};`,
      '',
      `var load = /*#__PURE__*/ init(${runtimeTemplate.basicFunction(
        'scopeName, scope, key',
        [
          'ensureExistence(scopeName, key);',
          'return get(findVersion(scope, key));',
        ]
      )});`,
      `var loadFallback = /*#__PURE__*/ init(${runtimeTemplate.basicFunction(
        'scopeName, scope, key, fallback',
        [
          `return scope && ${RuntimeGlobals.hasOwnProperty}(scope, key) ? get(findVersion(scope, key)) : fallback();`,
        ]
      )});`,
      `var loadVersionCheck = /*#__PURE__*/ init(${runtimeTemplate.basicFunction(
        'scopeName, scope, key, version',
        [
          'ensureExistence(scopeName, key);',
          'return get(findValidVersion(scope, key, version) || warnInvalidVersion(scope, scopeName, key, version) || findVersion(scope, key));',
        ]
      )});`,
      `var loadSingleton = /*#__PURE__*/ init(${runtimeTemplate.basicFunction(
        'scopeName, scope, key',
        [
          'ensureExistence(scopeName, key);',
          'return getSingleton(scope, scopeName, key);',
        ]
      )});`,
      `var loadSingletonVersionCheck = /*#__PURE__*/ init(${runtimeTemplate.basicFunction(
        'scopeName, scope, key, version',
        [
          'ensureExistence(scopeName, key);',
          'return getSingletonVersion(scope, scopeName, key, version);',
        ]
      )});`,
      `var loadStrictVersionCheck = /*#__PURE__*/ init(${runtimeTemplate.basicFunction(
        'scopeName, scope, key, version',
        [
          'ensureExistence(scopeName, key);',
          'return getValidVersion(scope, scopeName, key, version);',
        ]
      )});`,
      `var loadStrictSingletonVersionCheck = /*#__PURE__*/ init(${runtimeTemplate.basicFunction(
        'scopeName, scope, key, version',
        [
          'ensureExistence(scopeName, key);',
          'return getStrictSingletonVersion(scope, scopeName, key, version);',
        ]
      )});`,
      `var loadVersionCheckFallback = /*#__PURE__*/ init(${runtimeTemplate.basicFunction(
        'scopeName, scope, key, version, fallback',
        [
          `if(!scope || !${RuntimeGlobals.hasOwnProperty}(scope, key)) return fallback();`,
          'return get(findValidVersion(scope, key, version) || warnInvalidVersion(scope, scopeName, key, version) || findVersion(scope, key));',
        ]
      )});`,
      `var loadSingletonFallback = /*#__PURE__*/ init(${runtimeTemplate.basicFunction(
        'scopeName, scope, key, fallback',
        [
          `if(!scope || !${RuntimeGlobals.hasOwnProperty}(scope, key)) return fallback();`,
          'return getSingleton(scope, scopeName, key);',
        ]
      )});`,
      `var loadSingletonVersionCheckFallback = /*#__PURE__*/ init(${runtimeTemplate.basicFunction(
        'scopeName, scope, key, version, fallback',
        [
          `if(!scope || !${RuntimeGlobals.hasOwnProperty}(scope, key)) return fallback();`,
          'return getSingletonVersion(scope, scopeName, key, version);',
        ]
      )});`,
      `var loadStrictVersionCheckFallback = /*#__PURE__*/ init(${runtimeTemplate.basicFunction(
        'scopeName, scope, key, version, fallback',
        [
          `var entry = scope && ${RuntimeGlobals.hasOwnProperty}(scope, key) && findValidVersion(scope, key, version);`,
          `return entry ? get(entry) : fallback();`,
        ]
      )});`,
      `var loadStrictSingletonVersionCheckFallback = /*#__PURE__*/ init(${runtimeTemplate.basicFunction(
        'scopeName, scope, key, version, fallback',
        [
          `if(!scope || !${RuntimeGlobals.hasOwnProperty}(scope, key)) return fallback();`,
          'return getStrictSingletonVersion(scope, scopeName, key, version);',
        ]
      )});`,
      'var installedModules = __webpack_require__.installedModules',
      'var moduleToHandlerMapping = {',
      Template.indent(
        Array.from(
          moduleIdToSourceMapping,
          ([key, source]) => `${JSON.stringify(key)}: ${source.source()}`
        ).join(',\n')
      ),
      '};',
      'var listOfInitialIds = {',
      Template.indent(
        Array.from(moduleIdToSourceChunkID, ([key, chunkIds]) => {
          return `${JSON.stringify(key)}: ${JSON.stringify(
            Object.keys(chunkIds)
          )}`;
        }).join(',\n')
      ),
      '};',

      initialConsumes.length > 0
        ? Template.asString([
            //@ts-ignore
            `var initialConsumes = ${JSON.stringify(initialConsumes)};`,
            // `initialConsumes.forEach(${runtimeTemplate.basicFunction('id', [
            //   `${
            //     RuntimeGlobals.moduleFactories
            //   }[id] = ${runtimeTemplate.basicFunction('module', [
            //     '// Handle case when module is used sync',
            //     'installedModules[id] = 0;',
            //     `delete ${RuntimeGlobals.moduleCache}[id];`,
            //     'var factory = moduleToHandlerMapping[id]();',
            //     'if(typeof factory !== "function") throw new Error("Shared module is not available for eager consumption: " + id);',
            //     `module.exports = factory();`,
            //   ])}`,
            // ])});`,
          ])
        : '// no consumes in initial chunks',
      // this._runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers)
      Template.asString([
        `var chunkMapping = ${JSON.stringify(chunkToModuleMapping, null, '')};`,
        `const getEagerSharedForChunkId = ${runtimeTemplate.basicFunction(
          'chunkId, promises',
          [
            `if(${RuntimeGlobals.hasOwnProperty}(chunkMapping, chunkId)) {`,
            Template.indent([
              `chunkMapping[chunkId].forEach(${runtimeTemplate.basicFunction(
                'id',
                [
                  `console.log('checking if installed', id, ${RuntimeGlobals.hasOwnProperty}(installedModules, id));`,
                  `if(${RuntimeGlobals.hasOwnProperty}(installedModules, id)) return promises.push(installedModules[id]);`,
                  `var onFactory = ${runtimeTemplate.basicFunction('factory', [
                    'installedModules[id] = 0;',
                    `${
                      RuntimeGlobals.moduleFactories
                    }[id] = ${runtimeTemplate.basicFunction('module', [
                      `delete ${RuntimeGlobals.moduleCache}[id];`,
                      'module.exports = factory();',
                    ])}`,
                  ])};`,
                  `var onError = ${runtimeTemplate.basicFunction('error', [
                    'delete installedModules[id];',
                    "console.log('on error',id, error)",
                    `${
                      RuntimeGlobals.moduleFactories
                    }[id] = ${runtimeTemplate.basicFunction('module', [
                      `delete ${RuntimeGlobals.moduleCache}[id];`,
                      'throw error;',
                    ])}`,
                  ])};`,
                  'try {',
                  Template.indent([
                    'var promise = moduleToHandlerMapping[id]();',
                    'if(promise.then) {',
                    Template.indent(
                      "promises.push(installedModules[id] = promise.then(onFactory)['catch'](onError));"
                    ),
                    '} else onFactory(promise);',
                  ]),
                  '} catch(e) { onError(e); }',
                ]
              )});`,
            ]),
            '}',
          ]
        )}`,
      ]),
    ]);
  }
  //@ts-ignore
  mapChunks(compilation) {
    // @ts-ignore
    const { chunkGraph } = compilation;
    const { runtimeTemplate, moduleGraph } = compilation;
    const chunkToRemotesMapping = {};
    const idToExternalAndNameMapping = {};

    for (const entrypointModule of compilation.entrypoints.values()) {
      const entrypoint = entrypointModule.getEntrypointChunk();
      if (entrypoint.hasRuntime()) continue;

      for (const chunk of entrypoint.getAllInitialChunks()) {
        const modules = chunkGraph.getChunkModulesIterableBySourceType(
          chunk,
          'remote'
        );
        if (!modules) continue;
        //@ts-ignore
        const remotes = (chunkToRemotesMapping[chunk.id || chunk.name] = []);
        for (const m of modules) {
          const module = /** @type {RemoteModule} */ m;
          const name = module.internalRequest;
          const id = chunkGraph.getModuleId(module);
          const shareScope = module.shareScope;
          const dep = module.dependencies[0];
          const externalModule = moduleGraph.getModule(dep);
          const externalModuleId =
            externalModule && chunkGraph.getModuleId(externalModule);
          //@ts-ignore
          remotes.push(id);
          //@ts-ignore
          idToExternalAndNameMapping[id] = [shareScope, name, externalModuleId];
        }
      }
    }

    return Template.asString([
      `var remoteMapping = ${JSON.stringify(chunkToRemotesMapping, null, '')};`,
      `var idToExternalAndNameMapping = ${JSON.stringify(
        idToExternalAndNameMapping,
        null,
        ''
      )};`,
      `const getEagerRemotesForChunkID  = ${runtimeTemplate.basicFunction(
        'chunkId, promises',
        [
          "console.log('getEagerRemotesForChunkID', chunkId, remoteMapping[chunkId], remoteMapping);",
          `if(${RuntimeGlobals.hasOwnProperty}(remoteMapping, chunkId)) {`,
          Template.indent([
            `remoteMapping[chunkId].forEach(${runtimeTemplate.basicFunction(
              'id',
              [
                `var getScope = ${RuntimeGlobals.currentRemoteGetScope};`,
                'if(!getScope) getScope = [];',
                "console.log('idtoexternalandnamemapping', idToExternalAndNameMapping,id);",
                'var data = idToExternalAndNameMapping[id];',
                'if(getScope.indexOf(data) >= 0) return;',
                'getScope.push(data);',
                'console.log("data", data);',
                `if(data.p) return promises.push(data.p);`,
                `var onError = ${runtimeTemplate.basicFunction('error', [
                  'if(!error) error = new Error("Container missing");',
                  'if(typeof error.message === "string")',
                  Template.indent(
                    `error.message += '\\nwhile loading "' + data[1] + '" from ' + data[2];`
                  ),
                  `${
                    RuntimeGlobals.moduleFactories
                  }[id] = ${runtimeTemplate.basicFunction('', [
                    'throw error;',
                  ])}`,
                  'data.p = 0;',
                ])};`,
                `var handleFunction = ${runtimeTemplate.basicFunction(
                  'fn, arg1, arg2, d, next, first',
                  [
                    'try {',
                    Template.indent([
                      'var promise = fn(arg1, arg2);',
                      'if(promise && promise.then) {',
                      Template.indent([
                        `var p = promise.then(${runtimeTemplate.returningFunction(
                          'next(result, d)',
                          'result'
                        )}, onError);`,
                        `if(first) promises.push(data.p = p); else return p;`,
                      ]),
                      '} else {',
                      Template.indent(['return next(promise, d, first);']),
                      '}',
                    ]),
                    '} catch(error) {',
                    Template.indent(['onError(error);']),
                    '}',
                  ]
                )}`,
                `var onExternal = ${runtimeTemplate.returningFunction(
                  `external ? handleFunction(${RuntimeGlobals.initializeSharing}, data[0], 0, external, onInitialized, first) : onError()`,
                  'external, _, first'
                )};`,
                `var onInitialized = ${runtimeTemplate.returningFunction(
                  `handleFunction(external.get, data[1], getScope, 0, onFactory, first)`,
                  '_, external, first'
                )};`,
                `var onFactory = ${runtimeTemplate.basicFunction('factory', [
                  'data.p = 1;',
                  `${
                    RuntimeGlobals.moduleFactories
                  }[id] = ${runtimeTemplate.basicFunction('module', [
                    'module.exports = factory();',
                  ])}`,
                ])};`,
                'handleFunction(__webpack_require__, data[2], 0, 0, onExternal, 1);',
              ]
            )});`,
          ]),
          '}',
        ]
      )}`,
    ]);
  }
  addRemoteModules(modules: Iterable<Module>, entry: Chunk): void {
    if (!this.initialRemoteModules.has(entry.name)) {
      this.initialRemoteModules.set(entry.name, new Set());
    }
    const existing = this.initialRemoteModules.get(entry.name);
    for (const module of modules) {
      existing.add(module);
    }
  }

  apply(compiler: Compiler) {
    this.compiler = compiler;
    compiler.hooks.thisCompilation.tap('AsyncInverterPlugin', (compilation) => {
      const processChunksEagerRemote = (chunks: Set<Chunk>): void => {
        console.log('process chunks eager remote');
        for (const chunk of chunks) {
          if (chunk.hasRuntime()) continue;
          const modules =
            compilation.chunkGraph.getChunkModulesIterableBySourceType(
              chunk,
              'remote'
            ); //@ts-ignore

          // console.log(chunk.name, 'has eager remotes');
          if (modules) this.addRemoteModules(modules, chunk);
        }
      };
      // Always enabled
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const isEnabledForChunk = (_: Chunk) => true;
      const onceForChunkSet = new WeakSet();

      const hooks =
        compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
          compilation
        );
      hooks.renderStartup.tap(
        'AddCommentWebpackPlugin',
        //@ts-ignore
        (source, renderContext) => {
          // for (const entrypointModule of compilation.entrypoints.values()) {
          //   const entrypoint = entrypointModule.getEntrypointChunk();
          //   if (entrypoint.hasRuntime()) continue;
          //
          //   // search chunks for eager remote imports
          //   // processChunksEagerRemote(
          //   //   // get all the initial chunks (non async) of the entrypoint
          //   //   entrypoint.getAllInitialChunks()
          //   // );
          //   this.mapChunks(compilation);
          // }

          const initialChunkMaps = this.mapChunks(compilation);
          const initialShareMaps = this.mapShared(compilation);
          //@ts-ignore
          const replaceSource = source.source().split('\n');
          const searchString = '__webpack_exec__';
          const replaceString = '__webpack_exec_proxy__';
          //@ts-ignore
          // replaceSource = replaceSource.replace(searchString, replaceString);
          if (
            renderContext &&
            renderContext.constructor.name === 'NormalModule'
          ) {
            replaceSource[0] = replaceSource[0].replace(
              searchString,
              replaceString
            );
            replaceSource[2] = replaceSource[1];
            replaceSource[1] = `
              var cnn = ${JSON.stringify(compiler.options.output.uniqueName)};



          const onChunksLoaded = __webpack_require__.O;

const chunkIds = Object.values(listOfInitialIds).reduce((acc, val) => acc.concat(val), []);
// if(exports.id && exports.id === 'pages/_document') {
//  // getEagerSharedForChunkId(exports.id,__webpack_require__.initRemotes)
//  // getEagerSharedForChunkId('pages/_app',__webpack_require__.initRemotes)
//  // getEagerSharedForChunkId('pages/index',__webpack_require__.initRemotes)
// }
// //  getEagerSharedForChunkId(exports.id,__webpack_require__.initRemotes)
// // getEagerRemotesForChunkID(exports.id,__webpack_require__.initConsumes)


console.log("OM CHUNNKS", exports.id);
    __webpack_require__.O((thing)=>{
              console.log('result',thing)
              }, chunkIds, ()=>console.log('LOADEDEDEDED'), 0);


            var ${searchString} = function(moduleId) {
              console.log('[node]: next attempting to call', moduleId);
              console.log('[node]: intercepting', moduleId,'instantiation');
              console.log('checking if', exports.id, 'has eager --','number of eager:', listOfInitialIds.length);


return waitForContainer.then((thing)=>{
console.log('got container')
if(chunkMapping[exports.id]) {
return global.__remote_scope__.home_app.get('./'+exports.id)
}
console.log('consumes ready forr:',exports.id);
console.log(__webpack_require__.S.default);
console.loog('waitint gor init remote')

return Promise.all(__webpack_require__.initRemotes);

}).then(()=>{
console.log('constinaer ready forr:',exports.id);
console.log('waiting ro container init');
return Promise.all(__webpack_require__.initConsume s);

}).then(()=>{
console.log('async startup for entrypoint done');
//__webpack_require__.O(['pages/document'],()=>${replaceString}(moduleId), 0);
console.log('SUOULD REQUIRE PAged,m', moduleId);
return ${replaceString}(moduleId);
})

const myFunction = (thing)=>{
console.log('EVERYTHON IS LOADED');
}


               return Promise.resolve().then(() => {
             console.log('after init, before callback');
                    // console.log('before callback',Object.keys(__webpack_require__.S.default|| {'EMPTY': 'EMPTY'}));
              //console.log('preheating entry, but not returning', moduleId);
              const entrypoint = ${replaceString}(moduleId);
              //console.log('preheat:',entrypoint);
               return new Promise((resolve, reject) => {
             // console.log('after callback',Object.keys(__webpack_require__.S.default|| {'EMPTY': 'EMPTY'}));
              console.log('after callback',__webpack_require__.S.default['react/jsx-dev-runtime']['18.2.0'].get());
              setTimeout(() => {
              console.log('resolving entry to next', moduleId);
              resolve(${replaceString}(moduleId))
              },2000)
               });
               // return ${replaceString}(moduleId);
               })
              };
              `;
            return Template.asString([
              '',
              initialShareMaps,

              initialChunkMaps,

              `const waitForContainer = __webpack_require__.e("host_inner_ctn")`,
              ...replaceSource,
              '',
            ]);
          }
          const comment = `/* This is an entrypoint chunk: */\n`;
          //@ts-ignore
          return new ConcatSource(source, comment);
        }
      );
      compilation.hooks.optimizeChunks.tap(
        'AddModulesToRuntimeChunkPlugin',
        (chunks) => {
          console.log('optimize chunks');
          for (const entrypointModule of compilation.entrypoints.values()) {
            const entrypoint = entrypointModule.getEntrypointChunk();
            if (entrypoint.hasRuntime()) continue;

            // const initialChunkIds = this.getInitialChunkIds(
            //   entrypoint,
            //   compilation.chunkGraph
            // );

            // console.log('iniyi chunks;,', initialChunkIds);

            // search chunks for eager remote imports
            // processChunksEagerRemote(
            //   // get all the initial chunks (non async) of the entrypoint
            //   entrypoint.getAllInitialChunks()
            // );
            //  this.mapChunks(compilation, entrypoint);
          }
        }
      );
    });
  }
}

export default AsyncInverterPlugin;
