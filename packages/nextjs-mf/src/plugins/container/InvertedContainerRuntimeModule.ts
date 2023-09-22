/*
  MIT License http://www.opensource.org/licenses/mit-license.php
*/
import type { Chunk, Compiler, Module } from 'webpack';
import { RuntimeModule } from 'webpack';
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
  runtime: string; // The runtime environment.
  remotes: Record<string, string>; // A map of remote modules to their URLs.
  name?: string; // The name of the current module.
  debug?: boolean; // A flag to enable verbose logging.
  container?: string; // The name of the container module.
}

/**
 * Interface for ChunkLoadingContext, containing Webpack-related properties.
 */
interface ChunkLoadingContext {
  webpack: Compiler['webpack']; // The Webpack compiler instance.
  debug?: boolean; // A flag to enable verbose logging.
}

/**
 * InvertedContainerRuntimeModule is a Webpack runtime module that generates
 * the runtime code needed for loading federated modules in an inverted container.
 */
class InvertedContainerRuntimeModule extends RuntimeModule {
  private runtimeRequirements: Set<string>; // A set of runtime requirement strings.
  private options: InvertedContainerRuntimeModuleOptions; // Runtime module options.
  private chunkLoadingContext: ChunkLoadingContext; // Chunk loading context.

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

  /**
   * Resolves the container module.
   * @returns {Module | undefined} The entry module of the container.
   */
  private resolveContainerModule() {
    const { compilation } = this;
    if (!compilation) {
      return;
    }
    const { chunkGraph, entrypoints } = compilation;

    const container = entrypoints
      .get(this.options.container as string)
      ?.getRuntimeChunk?.();
    if (!container) {
      return;
    }

    const entryModules = chunkGraph.getChunkEntryModulesIterable(container);

    let entryModule;
    for (const module of entryModules) {
      entryModule = module;
      break;
    }

    return entryModule;
  }
  /**
   * This method maps shared modules and generates code for loading them.
   * @returns {string} The generated code for loading shared modules.
   */
  private mapShared(): string {
    if (!this.compilation) {
      return '';
    }

    const {
      runtimeTemplate,
      chunkGraph,
      codeGenerationResults,
      entrypoints,
      compiler,
    } = this.compilation;
    const { RuntimeGlobals, Template } = compiler.webpack;
    const chunkToModuleMapping = {};
    /** @type {Map<string | number, Source>} */
    const moduleIdToSourceMapping = new Map();
    const moduleIdToSourceChunkID = new Map();
    // @ts-ignore
    const initialConsumes = [];

    /**
     * This function adds shared modules to the list of modules.
     * @param {Iterable<Module>} modules - The modules to be added.
     * @param {Chunk} chunk - The chunk containing the modules.
     * @param {(string | number)[]} list - The list to which the modules are added.
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
      if (entrypoint.hasRuntime()) {
        continue;
      }

      // for (const entryChunks of entrypoint.getAllInitialChunks()) {}
      // @ts-ignore
      for (const chunk of entrypoint.getAllAsyncChunks()) {
        //if(chunk.hasEntryModule()) continue
        const modules = chunkGraph.getChunkModulesIterableBySourceType(
          chunk,
          'consume-shared'
        );
        if (!modules) {
          continue;
        }

        //@ts-ignore
        //  addModules(modules, chunk, (chunkToModuleMapping[chunk.id] = []));
      }
      // @ts-ignore
      for (const chunk of entrypoint.getAllInitialChunks()) {
        // if(chunk.hasEntryModule()) continue
        const modules = chunkGraph.getChunkModulesIterableBySourceType(
          chunk,
          'consume-shared'
        );
        if (!modules) {
          continue;
        }
        // @ts-ignore
        addModules(modules, chunk, (chunkToModuleMapping[chunk.id] = []));
        //@ts-ignore
        addShared(modules, chunk, initialConsumes);
      }
    }

    if (
      moduleIdToSourceMapping.size === 0 ||
      moduleIdToSourceChunkID.size === 0
    ) {
      return '';
    }
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
            `var initialConsumes = ${JSON.stringify(
              //@ts-ignore
              Array.from(new Set(initialConsumes))
            )};`,
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
                  `if(${RuntimeGlobals.hasOwnProperty}(installedModules, id)) return promises.push(installedModules[id]);`,
                  `if(typeof ${RuntimeGlobals.moduleCache}[id] === 'object') {
                ${RuntimeGlobals.moduleCache}[id].hot.removeDisposeHandler()
                ${RuntimeGlobals.moduleCache}[id].hot.addDisposeHandler(function (args){

                delete ${RuntimeGlobals.moduleCache}[id]


                ${RuntimeGlobals.moduleFactories}[id] = function(module) {
                return module.exports = globalThis.factoryTracker[id]
                }
                })

                }`,
                  `var onFactory = ${runtimeTemplate.basicFunction('factory', [
                    'installedModules[id] = 0;',
                    `${
                      RuntimeGlobals.moduleFactories
                    }[id] = ${runtimeTemplate.basicFunction('module', [
                      `delete ${RuntimeGlobals.moduleCache}[id];`,
                      'globalThis.factoryTracker[id] = module.exports = factory();',
                    ])}`,
                  ])};`,
                  `var onError = ${runtimeTemplate.basicFunction('error', [
                    'delete installedModules[id];',
                    this.options.debug
                      ? "console.error('on error',id, error)"
                      : '',
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


  /**
   * This method maps chunks and generates code for loading them.
   * @returns {string} The generated code for loading chunks.
   */
  private mapChunks(): string {
    if (!this.compilation || !this.chunkGraph) {
      return '';
    }
    const { chunkGraph, compilation } = this;
    const { runtimeTemplate, moduleGraph, entrypoints, compiler } = compilation;
    const { RuntimeGlobals, Template } = compiler.webpack;
    const chunkToRemotesMapping: { [key: string]: number[] } = {};
    const idToExternalAndNameMapping: {
      [key: string]: [string, string, number | string];
    } = {};

    // Iterate over all entrypoint modules
    for (const entrypointModule of entrypoints.values()) {
      const entrypoint = entrypointModule.getEntrypointChunk();
      if (entrypoint.hasRuntime()) {
        continue;
      }

      // Iterate over all initial chunks of the entrypoint
      for (const chunk of entrypoint.getAllInitialChunks()) {
        const modules = chunkGraph.getChunkModulesIterableBySourceType(
          chunk,
          'remote'
        ) as Module[];

        if (!modules) {
          continue;
        }
        const _id = chunk.id ?? chunk.name;
        if (!_id) {
          continue;
        }

        const remotes: (string | number)[] = (chunkToRemotesMapping[_id] = []);

        // Iterate over all modules
        for (const m of modules) {
          const module = m as Module & {
            internalRequest: string;
            shareScope: string;
          };

          const name = module.internalRequest;

          const id = chunkGraph.getModuleId(module);
          const {shareScope} = module;
          const dep = module.dependencies[0];
          const externalModule = moduleGraph.getModule(dep);

          if (!externalModule) {
            continue;
          }
          const externalModuleId =
            externalModule && chunkGraph.getModuleId(externalModule);
          if (!externalModuleId) {
            continue;
          }

          remotes.push(id);
          idToExternalAndNameMapping[id] = [shareScope, name, externalModuleId];
        }
      }
    }

    // Generate the final code string
    return Template.asString([
      `var remoteMapping = ${JSON.stringify(chunkToRemotesMapping, null, '')};`,
      `var idToExternalAndNameMapping = ${JSON.stringify(
        idToExternalAndNameMapping,
        null,
        ''
      )};`,
      'globalThis.factoryTracker = globalThis.factoryTracker  || {}',
      `__webpack_require__.getEagerRemotesForChunkId  = ${runtimeTemplate.basicFunction(
        'chunkId, promises',
        [
          `
          if(${RuntimeGlobals.hasOwnProperty}(remoteMapping, chunkId)) {`,
          Template.indent([
            `remoteMapping[chunkId].forEach(${runtimeTemplate.basicFunction(
              'id',
              [
                `if(typeof ${RuntimeGlobals.moduleCache}[id] === 'object') {
                ${RuntimeGlobals.moduleCache}[id].hot.removeDisposeHandler()
                ${RuntimeGlobals.moduleCache}[id].hot.addDisposeHandler(function (args){

                ${RuntimeGlobals.moduleCache}[id] = globalThis.factoryTracker[id];
                ${RuntimeGlobals.moduleFactories}[id] = function(module) {
                return module.exports = globalThis.factoryTracker[id]
                }
                })

                }`,
                `var getScope = ${RuntimeGlobals.currentRemoteGetScope};`,
                'if(!getScope) getScope = [];',
                'var data = idToExternalAndNameMapping[id];',
                'if(getScope.indexOf(data) >= 0) return;',
                'getScope.push(data);',
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
                `var onExternal = ${runtimeTemplate.basicFunction(
                  ['external', '_', 'first'],
                  `
                  return external ? handleFunction(${RuntimeGlobals.initializeSharing}, data[0], 0, external, onInitialized, first) : onError()`
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
                    'globalThis.factoryTracker[id] = module.exports = (globalThis.factoryTracker[id] || factory());',
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
    if (!this.compilation || !this.chunk || !this.chunkGraph) {
      return '';
    }

    const {compilation} = this;

    const { name } = this.options;
    const { chunkGraph, chunk } = this;
    const { compiler } = compilation;

    const { RuntimeGlobals, Template, javascript } = compiler.webpack || {};
    const chunkHasJs =
      (javascript && javascript.JavascriptModulesPlugin.chunkHasJs) ||
      require('webpack/lib/javascript/JavascriptModulesPlugin').chunkHasJs;

    const containerEntryModule = this.resolveContainerModule() as
      | (Module & { _name: string })
      | undefined;
    //server runtime is always called webpack-runtime
    const isServer = chunk.name === 'webpack-runtime';
    const isApi = chunk.name === 'webpack-api-runtime';
    const conditionMap = chunkGraph.getChunkConditionMap(chunk, chunkHasJs);
    // const hasJsMatcher = compileBooleanMatcher(conditionMap);
    // find the main webpack runtime, skip all other chunks
    if (chunk.name !== 'webpack-runtime' && chunk.name !== 'webpack') {
      return Template.asString('');
    }

    const containerEntry = [containerEntryModule].map((module) => {
      const containerName = module?._name || name;
      const containerModuleId = module?.id || module?.debugId;

      if (!(containerName && containerName)) {
        return '';
      }

      // const globalRef = compilation.options.output?.globalObject;
      //@ts-ignore
      const nodeGlobal = compilation.options?.node?.global;

      const globalObject = nodeGlobal
        ? RuntimeGlobals.global || 'global'
        : 'global';

      const containerScope =
        isServer || isApi
          ? [globalObject, "['__remote_scope__']"].join('')
          : 'window';
      const runtimeId = chunk.id;
      const serverContainerKickstart = ''

      const checkForAsyncChunkRequirements = Template.asString([
        `__webpack_require__.checkAsyncReqs = function() {`,
        Template.indent([
          `self[${JSON.stringify(
            compilation.outputOptions.chunkLoadingGlobal
          )}].forEach(function(chunkId) {`,
          Template.indent([
            `if(__webpack_require__.getEagerSharedForChunkId) {__webpack_require__.getEagerSharedForChunkId(chunkId[0],__webpack_require__.initConsumes)}`,
            `if(__webpack_require__.getEagerRemotesForChunkId) {__webpack_require__.getEagerRemotesForChunkId(chunkId[0],__webpack_require__.initRemotes)}`,
          ]),
          '});',
        ]),
        '}',
      ]);

      const browserContainerKickstart = Template.asString([
        '__webpack_require__.own_remote = new Promise(function(resolve,reject){',
        this.options.debug
          ? 'console.debug("O keys",Object.keys(__webpack_require__.O))'
          : '',
        `__webpack_require__.O(0, [${JSON.stringify(runtimeId)}], function() {`,
        this.options.debug
          ? "console.debug('runtime loaded, replaying all installed chunk requirements');"
          : '',
        '__webpack_require__.checkAsyncReqs();',
        'attachRemote(resolve)',
        '},0)',
        '})',
      ]);

      // __webpack_require__.O(0, ["webpack-runtime"], function() {
      return Template.asString([
        'globalThis.usedChunks = globalThis.usedChunks || new Set();',
        'globalThis.backupScope = globalThis.backupScope || {};',
        '__webpack_require__.S = globalThis.backupScope;',
        '__webpack_require__.initConsumes = __webpack_require__.initConsumes || [];',
        '__webpack_require__.initRemotes = __webpack_require__.initRemotes || [];',
        '__webpack_require__.installedModules = {};',
        this.options.debug
          ? "console.debug('share scope', __webpack_require__.S);"
          : '',
        `if(${containerScope} === undefined) {`,
        this.options.debug
          ? `console.debug('container scope is empty, initializing');`
          : '',
        `${containerScope} = {_config: {}}
        };`,
        checkForAsyncChunkRequirements,
        Template.asString([
          'function attachRemote (resolve) {',
          Template.indent([
            `const innerRemote = __webpack_require__(${JSON.stringify(
              containerModuleId
            )});`,
            `${containerScope}[${JSON.stringify(
              containerName
            )}] = innerRemote;`,
            "__webpack_require__.I('default',[globalThis.backupScope]);",
            this.options.debug
              ? "console.debug('remote attached', innerRemote);"
              : '',
            'if(resolve) resolve(innerRemote)',
          ]),
          '}',
        ]),
        'try {',
        isServer ? serverContainerKickstart : browserContainerKickstart,
        '} catch (e) {',
        "console.error('host runtime was unable to initialize its own remote', e);",
        '}',
        this.mapChunks(),
        this.mapShared(),
      ]);
    });
    return Template.asString(containerEntry);
  }
}

export default InvertedContainerRuntimeModule;

