/* eslint-disable @typescript-eslint/no-var-requires */
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
*/

'use strict';

import type { Chunk, ChunkGraph, Compiler } from 'webpack';
import { Compilation, RuntimeModule, Template } from 'webpack';
// @ts-ignore
import { getUndoPath } from 'webpack/lib/util/identifier';
// @ts-ignore
import compileBooleanMatcher from 'webpack/lib/util/compileBooleanMatcher';
import {
  parseVersionRuntimeCode,
  versionLtRuntimeCode,
  rangeToStringRuntimeCode,
  satisfyRuntimeCode,
  //@ts-ignore
} from 'webpack/lib/util/semver';
/**
 * Interface for InvertedContainerRuntimeModuleOptions, containing
 * options for the InvertedContainerRuntimeModule class.
 */
interface InvertedContainerRuntimeModuleOptions {
  runtime: string;
  remotes: Record<string, string>; // A map of remote modules to their URLs.
  name?: string; // The name of the current module.
  verbose?: boolean; // A flag to enable verbose logging.
  container?: string; // The name of the container module.
}

/**
 * Interface for ChunkLoadingContext, containing Webpack-related properties.
 */
interface ChunkLoadingContext {
  webpack: Compiler['webpack'];
}

/**
 * InvertedContainerRuntimeModule is a Webpack runtime module that generates
 * the runtime code needed for loading federated modules in an inverted container.
 */
class InvertedContainerRuntimeModule extends RuntimeModule {
  private runtimeRequirements: Set<string>;
  private options: InvertedContainerRuntimeModuleOptions;
  private chunkLoadingContext: ChunkLoadingContext;

  /**
   * Constructor for the InvertedContainerRuntimeModule.
   * @param {Set<string>} runtimeRequirements - A set of runtime requirement strings.
   * @param {InvertedContainerRuntimeModuleOptions} options - Runtime module options.
   * @param {ChunkLoadingContext} chunkLoadingContext - Chunk loading context.
   */
  constructor(
    runtimeRequirements: Set<string>,
    options: InvertedContainerRuntimeModuleOptions,
    chunkLoadingContext: ChunkLoadingContext
  ) {
    super('inverted container startup', RuntimeModule.STAGE_ATTACH);
    this.runtimeRequirements = runtimeRequirements;

    this.options = options;
    this.chunkLoadingContext = chunkLoadingContext;
  }

  resolveContainerModule() {
    const container = this.compilation.entrypoints
      .get(this.options.container as string)
      ?.getRuntimeChunk?.();
    const entryModule = container?.entryModule;
    return entryModule;
  }

  mapShared() {
    const {
      runtimeTemplate,
      chunkGraph,
      codeGenerationResults,
      entrypoints,
      compiler,
    } = this.compilation;
    const { RuntimeGlobals } = compiler.webpack;
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

    for (const entrypointModule of entrypoints.values()) {
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
      return '';

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
        `__webpack_require__.getEagerSharedForChunkId = ${runtimeTemplate.basicFunction(
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
  mapChunks() {
    // @ts-ignore
    const { chunkGraph, compilation } = this;
    const { runtimeTemplate, moduleGraph, entrypoints, compiler } = compilation;
    const { RuntimeGlobals } = compiler.webpack;
    const chunkToRemotesMapping = {};
    const idToExternalAndNameMapping = {};

    for (const entrypointModule of entrypoints.values()) {
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
          //@ts-ignore
          const name = module.internalRequest;
          //@ts-ignore
          const id = chunkGraph.getModuleId(module);
          //@ts-ignore
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
      `__webpack_require__.getEagerRemotesForChunkId  = ${runtimeTemplate.basicFunction(
        'chunkId, promises',
        [
          "console.log('getEagerRemotesForChunkId', chunkId, remoteMapping[chunkId], remoteMapping);",
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
  /**
   * Generate method for the runtime module, producing the runtime code.
   * @returns {string} runtime code
   */
  override generate() {
    const { name } = this.options;

    const { webpack } = this.chunkLoadingContext;
    const chunkHasJs =
      (webpack && webpack.javascript.JavascriptModulesPlugin.chunkHasJs) ||
      require('webpack/lib/javascript/JavascriptModulesPlugin').chunkHasJs;

    const containerEntryModule = this.resolveContainerModule();
    const { chunkGraph, chunk } = this;
    //server runtime is always called webpack-runtime
    const isServer = chunk.name === 'webpack-runtime';
    const conditionMap = chunkGraph.getChunkConditionMap(chunk, chunkHasJs);
    // const hasJsMatcher = compileBooleanMatcher(conditionMap);
    // find the main webpack runtime, skip all other chunks
    if (chunk.name !== 'webpack-runtime' && chunk.name !== 'webpack') {
      return Template.asString('');
    }

    const containerEntry = [containerEntryModule].map((module) => {
      //@ts-ignore
      const containerName = module?._name || name;
      const containerModuleId = module?.id || module?.debugId;

      if (!(containerName && containerName)) {
        return '';
      }

      // const globalRef = this.compilation.options.output?.globalObject;
      //@ts-ignore
      const nodeGlobal = this.compilation.options?.node?.global;
      const globalObject = nodeGlobal
        ? webpack.RuntimeGlobals.global || 'global'
        : 'global';

      const containerScope = isServer
        ? [globalObject, "['__remote_scope__']"].join('')
        : 'window';

      return Template.asString([
        `

      __webpack_require__.initConsumes = [];
      __webpack_require__.initRemotes = [];
      __webpack_require__.installedModules = {};
      var containerAttachObject = ${containerScope}

function attachRemote (resolve) {
  const innerRemote = __webpack_require__(${JSON.stringify(containerModuleId)});
  containerAttachObject[${JSON.stringify(containerName)}] = innerRemote
  if(resolve) resolve(innerRemote)
}

        globalThis.backupScope = globalThis.backupScope || {};
          __webpack_require__.S = globalThis.backupScope;

        if(typeof window === 'undefined') {
          if(global.__remote_scope__ === undefined) { global.__remote_scope__ = {_config: {}} };


          __webpack_require__.own_remote = new Promise(function(resolve,reject){
          var containerAttachObject = typeof window !== 'undefined' ? window : ${globalObject}['__remote_scope__']

__webpack_require__.O.bind(__webpack_require__.O, 0, ["host_inner_ctn"], function() {
              attachRemote(resolve)
        },1)



             __webpack_require__.O(0, ["webpack-runtime"], function() {

             __webpack_require__.O(0, ["host_inner_ctn"], function() {
                      attachRemote(resolve)
                },1)
               console.log(__webpack_require__.m[${JSON.stringify(
                 containerModuleId
               )}]);
              if(!__webpack_require__.m[${JSON.stringify(containerModuleId)}]) {
            let promises = []

              //            __webpack_require__.f.readFileVm('host_inner_ctn',promises).then(()=>console.log('ENSURE CHUNK'))
              // console.log(promises);
                        require.cache[require.resolve("./host_inner_ctn" +${JSON.stringify(
                          containerName
                        )})] = undefined
                         require("./host_inner_ctn" + ${JSON.stringify(
                           containerName
                         )});
                      } else {
                      attachRemote(resolve)
                }
        },0)



      })
        } else {


        ${webpack.RuntimeGlobals.shareScopeMap}['default'] = ${
          webpack.RuntimeGlobals.shareScopeMap
        }['default'] || {};}
        try {
         __webpack_require__.O(0, ["webpack"], function() {
         console.log('runtime loaded');
         console.log('m',__webpack_require__.m)
         console.log('c',__webpack_require__.c)
        attachRemote()

         },0)
        // install custom module into webpack modules from runtime

      } catch (e) {
        console.error('host runtime was unable to initialize its own remote', e);
      }`,
        this.mapChunks(),
        this.mapShared(),
      ]);
    });
    return Template.asString(containerEntry);
  }
}

export default InvertedContainerRuntimeModule;
