/*
  MIT License http://www.opensource.org/licenses/mit-license.php
*/
import type { Chunk, ChunkGraph, Compiler } from 'webpack';
import { RuntimeModule, RuntimeGlobals, Template } from 'webpack';
import { getUndoPath } from 'webpack/lib/util/identifier';
import compileBooleanMatcher from 'webpack/lib/util/compileBooleanMatcher';

import loadScriptTemplate, { executeLoadTemplate } from './loadScript';

interface RemotesByType {
  functional: string[];
  normal: string[];
}

interface ReadFileChunkLoadingRuntimeModuleOptions {
  baseURI: Compiler['options']['output']['publicPath'];
  promiseBaseURI?: string;
  remotes: Record<string, string>;
  name?: string;
  debug?: boolean;
}

interface ChunkLoadingContext {
  webpack: Compiler['webpack'];
}

class ReadFileChunkLoadingRuntimeModule extends RuntimeModule {
  private runtimeRequirements: Set<string>;
  private options: ReadFileChunkLoadingRuntimeModuleOptions;
  private chunkLoadingContext: ChunkLoadingContext;

  constructor(
    runtimeRequirements: Set<string>,
    options: ReadFileChunkLoadingRuntimeModuleOptions,
    chunkLoadingContext: ChunkLoadingContext,
  ) {
    super('readFile chunk loading', RuntimeModule.STAGE_ATTACH);
    this.runtimeRequirements = runtimeRequirements;

    this.options = options;
    this.chunkLoadingContext = chunkLoadingContext;
  }

  /**
   * @private
   * @param {Chunk} chunk chunk
   * @param {string} rootOutputDir root output directory
   * @returns {string} generated code
   */
  _generateBaseUri(chunk: Chunk, rootOutputDir: string) {
    const options = chunk.getEntryOptions();
    if (options && options.baseUri) {
      return `${RuntimeGlobals.baseURI} = ${JSON.stringify(options.baseUri)};`;
    }

    return `${RuntimeGlobals.baseURI} = require("url").pathToFileURL(${
      rootOutputDir
        ? `__dirname + ${JSON.stringify('/' + rootOutputDir)}`
        : '__filename'
    });`;
  }

  /**
   * @private
   * @param {unknown[]} items item to log
   */
  _getLogger(...items: unknown[]) {
    if (!this.options.debug) {
      return '';
    }

    return `console.log(${items.join(',')});`;
  }

  /**
   * @returns {string} runtime code
   */
  override generate() {
    // name in this context is always the current remote itself.
    // this code below is in each webpack runtime, host and remotes
    // remote entries handle their own loading of chunks, so i have fractal self awareness
    // hosts will likely never run the http chunk loading runtime, they use fs.readFile
    // remotes only use fs.readFile if we were to cache the chunks on disk after fetching - otherwise its always using http
    // so for example, if im in hostA and require(remoteb/module) --> console.log of name in runtime code will return remoteb

    const { remotes = {}, name } = this.options;
    // for delegate modules, we need to avoid serializing internal modules, only register primitive configs in the runtime
    // delegates have their own registration code, so we dont need to handle them here.
    const remotesByType: RemotesByType = Object.values(remotes).reduce(
      (acc: RemotesByType, remote: string) => {
        if (
          remote.startsWith('promise ') ||
          remote.startsWith('internal ') ||
          remote.startsWith('external ')
        ) {
          acc.functional.push(remote);
        } else {
          acc.normal.push(remote);
        }
        return acc;
      },
      { functional: [], normal: [] },
    );

    const { webpack } = this.chunkLoadingContext;
    const { chunkGraph, chunk, compilation } = this;

    if (!chunkGraph || !chunk || !compilation) {
      return '';
    }

    const { runtimeTemplate } = compilation;

    const jsModulePlugin =
      webpack?.javascript.JavascriptModulesPlugin ||
      require('webpack/lib/javascript/JavascriptModulesPlugin');

    const { chunkHasJs } = jsModulePlugin;

    // workaround for next.js
    const getInitialChunkIds = (chunk: Chunk, chunkGraph: ChunkGraph) => {
      const initialChunkIds = new Set(chunk.ids);
      for (const c of chunk.getAllInitialChunks()) {
        if (c === chunk || chunkHasJs(c, chunkGraph)) {
          continue;
        }
        if (c.ids) {
          for (const id of c.ids) initialChunkIds.add(id);
        }
        for (const c of chunk.getAllAsyncChunks()) {
          if (c === chunk || chunkHasJs(c, chunkGraph)) {
            continue;
          }
          if (c.ids) {
            for (const id of c.ids) initialChunkIds.add(id);
          }
        }
      }
      return initialChunkIds;
    };

    const fn = RuntimeGlobals.ensureChunkHandlers;
    const withBaseURI = this.runtimeRequirements.has(RuntimeGlobals.baseURI);
    const withExternalInstallChunk = this.runtimeRequirements.has(
      RuntimeGlobals.externalInstallChunk,
    );

    const withOnChunkLoad = this.runtimeRequirements.has(
      RuntimeGlobals.onChunksLoaded,
    );
    const withLoading = this.runtimeRequirements.has(
      RuntimeGlobals.ensureChunkHandlers,
    );
    const withHmr = this.runtimeRequirements.has(
      RuntimeGlobals.hmrDownloadUpdateHandlers,
    );
    const withHmrManifest = this.runtimeRequirements.has(
      RuntimeGlobals.hmrDownloadManifest,
    );

    const conditionMap = chunkGraph.getChunkConditionMap(chunk, chunkHasJs);
    const hasJsMatcher = compileBooleanMatcher(conditionMap);
    const initialChunkIds = getInitialChunkIds(chunk, chunkGraph); // , chunkHasJs);

    const outputName = compilation.getPath(
      jsModulePlugin.getChunkFilenameTemplate(chunk, compilation.outputOptions),
      {
        chunk,
        contentHashType: 'javascript',
      },
    );

    const rootOutputDir = getUndoPath(
      outputName,
      compilation.outputOptions.path,
      false,
    );

    const stateExpression = withHmr
      ? `${RuntimeGlobals.hmrRuntimeStatePrefix}_readFileVm`
      : undefined;
    return Template.asString([
      withBaseURI
        ? this._generateBaseUri(chunk, rootOutputDir)
        : '// no baseURI',
      '',
      '// object to store loaded chunks',
      '// "0" means "already loaded", Promise means loading',
      `var installedChunks = ${
        stateExpression ? `${stateExpression} = ${stateExpression} || ` : ''
      }{`,
      Template.indent(
        Array.from(initialChunkIds, (id) => `${JSON.stringify(id)}: 0`).join(
          ',\n',
        ),
      ),
      '};',
      '',
      withOnChunkLoad
        ? `${
            RuntimeGlobals.onChunksLoaded
          }.readFileVm = ${runtimeTemplate.returningFunction(
            'installedChunks[chunkId] === 0',
            'chunkId',
          )};`
        : '// no on chunks loaded',
      '',
      withLoading || withExternalInstallChunk
        ? `var installChunk = ${runtimeTemplate.basicFunction('chunk', [
            'var moreModules = chunk.modules, chunkIds = chunk.ids, runtime = chunk.runtime;',
            'for(var moduleId in moreModules) {',
            Template.indent([
              `if(${RuntimeGlobals.hasOwnProperty}(moreModules, moduleId)) {`,
              Template.indent([
                `${RuntimeGlobals.moduleFactories}[moduleId] = moreModules[moduleId];`,
              ]),
              '}',
            ]),
            '}',
            `if(runtime) runtime(__webpack_require__);`,
            'for(var i = 0; i < chunkIds.length; i++) {',
            Template.indent([
              'if(installedChunks[chunkIds[i]]) {',
              Template.indent(['installedChunks[chunkIds[i]][0]();']),
              '}',
              'installedChunks[chunkIds[i]] = 0;',
            ]),
            '}',
            withOnChunkLoad ? `${RuntimeGlobals.onChunksLoaded}();` : '',
          ])};`
        : '// no chunk install function needed',
      '',
      withLoading
        ? Template.asString([
            '// load script equivalent for server side',
            `${RuntimeGlobals.loadScript} = ${runtimeTemplate.basicFunction(
              'url,callback,chunkId',
              [
                Template.indent([
                  'if(!globalThis.__remote_scope__) {',
                  Template.indent([
                    '// create a global scope for container, similar to how remotes are set on window in the browser',
                    'globalThis.__remote_scope__ = {',
                    '_config: {},',
                    '}',
                  ]),
                  '}',
                ]),
                Template.indent([
                  executeLoadTemplate,
                  `executeLoad(url,callback,chunkId)`,
                ]),
              ],
            )}`,
          ])
        : '// no remote script loader needed',
      withLoading
        ? Template.asString([
            '// ReadFile + VM.run chunk loading for javascript',
            `${fn}.readFileVm = function(chunkId, promises) {`,
            hasJsMatcher !== false
              ? Template.indent([
                  '',
                  'var installedChunkData = installedChunks[chunkId];',
                  'if(installedChunkData !== 0) { // 0 means "already installed".',
                  Template.indent([
                    '// array of [resolve, reject, promise] means "currently loading"',
                    'if(installedChunkData) {',
                    Template.indent(['promises.push(installedChunkData[2]);']),
                    '} else {',
                    Template.indent([
                      hasJsMatcher === true
                        ? 'if(true) { // all chunks have JS'
                        : `if(${hasJsMatcher('chunkId')}) {`,
                      Template.indent([
                        '// load the chunk and return promise to it',
                        'var promise = new Promise(async function(resolve, reject) {',
                        Template.indent([
                          'installedChunkData = installedChunks[chunkId] = [resolve, reject];',
                          `var filename = typeof process !== "undefined" ? require('path').join(__dirname, ${JSON.stringify(
                            rootOutputDir,
                          )} + ${
                            RuntimeGlobals.getChunkScriptFilename
                          }(chunkId)) : false;`,
                          'var fs = typeof process !== "undefined" ? require(\'fs\') : false;',
                          'if(fs && fs.existsSync(filename)) {',
                          this._getLogger(
                            `'chunk filename local load', chunkId`,
                          ),
                          Template.indent([
                            "fs.readFile(filename, 'utf-8', function(err, content) {",
                            Template.indent([
                              'if(err) return reject(err);',
                              'var chunk = {};',
                              "require('vm').runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\\n})', filename)" +
                                "(chunk, require, require('path').dirname(filename), filename);",
                              'installChunk(chunk);',
                            ]),
                            '});',
                          ]),
                          '} else {',
                          Template.indent([
                            loadScriptTemplate,
                            this._getLogger(
                              `'needs to load remote module from ${JSON.stringify(
                                name,
                              )}'`,
                            ),
                            this._getLogger(
                              `'remotes known to'`,
                              JSON.stringify(name),
                              JSON.stringify(remotes),
                            ),
                            // keys are mostly useless here, we want to find remote by its global (unique name)
                            `var remotes = ${JSON.stringify(
                              Object.values(remotes).reduce(
                                (acc, remote) => {
                                  //TODO: need to handle all other cases like when remote is not a @ syntax string
                                  const [global, url] = remote.split('@');
                                  acc[global] = url;
                                  return acc;
                                },
                                {} as Record<string, string>,
                              ),
                            )};`,
                            Template.indent([
                              'if(!globalThis.__remote_scope__) {',
                              Template.indent([
                                '// create a global scope for container, similar to how remotes are set on window in the browser',
                                'globalThis.__remote_scope__ = {',
                                '_config: {},',
                                '}',
                              ]),
                              '}',
                            ]),
                            //TODO: double check this file and see if we can remove assigning to global scope (its a older hack)
                            // 'Object.assign(globalThis.__remote_scope__._config, remotes)',
                            'const remoteRegistry = globalThis.__remote_scope__._config',
                            /*
                      TODO: keying by global should be ok, but need to verify - need to deal with when user passes promise new promise() global will/should still exist - but can only be known at runtime
                    */
                            this._getLogger(
                              `'remotes keyed by global name'`,
                              JSON.stringify(remotes),
                            ),
                            this._getLogger(
                              `'remote scope configs'`,
                              'globalThis.__remote_scope__._config',
                            ),

                            this._getLogger(`'before remote scope'`),
                            this._getLogger(
                              `'globalThis.__remote_scope__'`,
                              `globalThis.__remote_scope__`,
                            ),
                            this._getLogger(
                              `'globalThis.__remote_scope__[${JSON.stringify(
                                name,
                              )}]'`,
                              `globalThis.__remote_scope__[${JSON.stringify(
                                name,
                              )}]`,
                            ),

                            /*   TODO: this global.REMOTE_CONFIG doesnt work in this v5 core, not sure if i need to keep it or not
                         not deleting it yet since i might need this for tracking all the remote entries across systems
                         for now, im going to use locally known remote scope from remoteEntry config
                         update: We will most likely need this, since remote would not have its own config
                         id need to access the host system and find the known url
                          basically this is how i create publicPath: auto on servers.
                         `var requestedRemote = global.REMOTE_CONFIG[${JSON.stringify(
                          name
                        )}]`,
                     */
                            `var requestedRemote = remoteRegistry[${JSON.stringify(
                              name,
                            )}]`,
                            this._getLogger(
                              `'requested remote'`,
                              `requestedRemote`,
                            ),
                            /*TODO: we need to support when user implements own promise new promise function
                            for example i have my own promise remotes, not global@remotename
                            so there could be cases where remote may be function still - not sure */

                            /*TODO: need to handle if chunk fetch fails/crashes - ensure server still can keep loading
                            right now if you throw an error in here, server will stall forever */

                            `if(typeof requestedRemote === 'function'){
                    requestedRemote = await requestedRemote()
                  }`,
                            this._getLogger(
                              `'var requestedRemote'`,
                              `requestedRemote`,
                            ),

                            // example: uncomment this and server will never reply
                            // `var scriptUrl = new URL(requestedRemote.split("@")[1]);`,
                            // since im looping over remote and creating global at build time, i dont need to split string at runtime
                            // there may still be a use case for that with promise new promise, depending on how we design it.
                            this._getLogger(
                              '"requestedRemote"',
                              'requestedRemote',
                              'current name',
                              JSON.stringify(name),
                            ),
                            `var scriptUrl = new URL(requestedRemote);`,

                            this._getLogger(
                              `'globalThis.__remote_scope__'`,
                              `globalThis.__remote_scope__`,
                            ),
                            `var chunkName = ${RuntimeGlobals.getChunkScriptFilename}(chunkId);`,
                            this._getLogger(
                              `'chunkname to request'`,
                              `chunkName`,
                            ),
                            `
                        var getBasenameFromUrl = (url) => {
                          const urlParts = url.split('/');
                          return urlParts[urlParts.length - 1];
                        };
                        var fileToReplace = typeof process !== "undefined" ? require('path').basename(scriptUrl.pathname) : getBasenameFromUrl(scriptUrl.pathname);`,
                            `scriptUrl.pathname = scriptUrl.pathname.replace(fileToReplace, chunkName);`,
                            this._getLogger(
                              `'will load remote chunk'`,
                              `scriptUrl.toString()`,
                            ),
                            `loadScript(scriptUrl.toString(), function(err, content) {`,
                            Template.indent([
                              this._getLogger(`'load script callback fired'`),
                              "if(err) {console.error('error loading remote chunk', scriptUrl.toString(),'got',content); return reject(err);}",
                              'var chunk = {};',
                              "if(typeof process !== 'undefined') {",
                              'try {',
                              "require('vm').runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\\n})', filename)" +
                                "(chunk, require, require('path').dirname(filename), filename);",
                              '} catch (e) {',
                              "console.error('runInThisContext threw', e)",
                              '}',
                              '} else {',
                              "eval('(function(exports, require, __dirname, __filename) {' + content + '\\n})')(chunk, __webpack_require__, '.', chunkName);",
                              '}',
                              'installChunk(chunk);',
                            ]),
                            '});',
                          ]),
                          '}',
                        ]),
                        '});',
                        'promises.push(installedChunkData[2] = promise);',
                      ]),
                      '} else installedChunks[chunkId] = 0;',
                    ]),
                    '}',
                  ]),
                  '}',
                ])
              : Template.indent(['installedChunks[chunkId] = 0;']),
            '};',
          ])
        : '// no chunk loading',
      '',
      withExternalInstallChunk
        ? Template.asString([
            'module.exports = __webpack_require__;',
            `${RuntimeGlobals.externalInstallChunk} = function(){`,
            this.options.debug
              ? `console.debug('node: webpack installing to install chunk id:', arguments['0'].id);`
              : '',
            `return installChunk.apply(this, arguments)};`,
          ])
        : '// no external install chunk',
      '',
      withHmr
        ? Template.asString([
            'function loadUpdateChunk(chunkId, updatedModulesList) {',
            Template.indent([
              'return new Promise(function(resolve, reject) {',
              Template.indent([
                `var filename = require('path').join(__dirname, ${JSON.stringify(
                  rootOutputDir,
                )} + ${RuntimeGlobals.getChunkUpdateScriptFilename}(chunkId));`,
                "require('fs').readFile(filename, 'utf-8', function(err, content) {",
                Template.indent([
                  'if(err) return reject(err);',
                  'var update = {};',
                  "require('vm').runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\\n})', filename)" +
                    "(update, require, require('path').dirname(filename), filename);",
                  'var updatedModules = update.modules;',
                  'var runtime = update.runtime;',
                  'for(var moduleId in updatedModules) {',
                  Template.indent([
                    `if(${RuntimeGlobals.hasOwnProperty}(updatedModules, moduleId)) {`,
                    Template.indent([
                      `currentUpdate[moduleId] = updatedModules[moduleId];`,
                      'if(updatedModulesList) updatedModulesList.push(moduleId);',
                    ]),
                    '}',
                  ]),
                  '}',
                  'if(runtime) currentUpdateRuntime.push(runtime);',
                  'resolve();',
                ]),
                '});',
              ]),
              '});',
            ]),
            '}',
            '',
            Template.getFunctionContent(
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              require('webpack/lib/hmr/JavascriptHotModuleReplacement.runtime.js'),
            )
              .replace(/\$key\$/g, 'readFileVm')
              .replace(/\$installedChunks\$/g, 'installedChunks')
              .replace(/\$loadUpdateChunk\$/g, 'loadUpdateChunk')
              .replace(/\$moduleCache\$/g, RuntimeGlobals.moduleCache)
              .replace(/\$moduleFactories\$/g, RuntimeGlobals.moduleFactories)
              .replace(
                /\$ensureChunkHandlers\$/g,
                RuntimeGlobals.ensureChunkHandlers,
              )
              .replace(/\$hasOwnProperty\$/g, RuntimeGlobals.hasOwnProperty)
              .replace(/\$hmrModuleData\$/g, RuntimeGlobals.hmrModuleData)
              .replace(
                /\$hmrDownloadUpdateHandlers\$/g,
                RuntimeGlobals.hmrDownloadUpdateHandlers,
              )
              .replace(
                /\$hmrInvalidateModuleHandlers\$/g,
                RuntimeGlobals.hmrInvalidateModuleHandlers,
              ),
          ])
        : '// no HMR',
      '',
      withHmrManifest
        ? Template.asString([
            `${RuntimeGlobals.hmrDownloadManifest} = function() {`,
            Template.indent([
              'return new Promise(function(resolve, reject) {',
              Template.indent([
                `var filename = require('path').join(__dirname, ${JSON.stringify(
                  rootOutputDir,
                )} + ${RuntimeGlobals.getUpdateManifestFilename}());`,
                "require('fs').readFile(filename, 'utf-8', function(err, content) {",
                Template.indent([
                  'if(err) {',
                  Template.indent([
                    'if(err.code === "ENOENT") return resolve();',
                    'return reject(err);',
                  ]),
                  '}',
                  'try { resolve(JSON.parse(content)); }',
                  'catch(e) { reject(e); }',
                ]),
                '});',
              ]),
              '});',
            ]),
            '}',
          ])
        : '// no HMR manifest',
    ]);
  }
}

export default ReadFileChunkLoadingRuntimeModule;
