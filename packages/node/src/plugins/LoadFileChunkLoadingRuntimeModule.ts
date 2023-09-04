/*
  MIT License http://www.opensource.org/licenses/mit-license.php
*/
import type { Chunk, ChunkGraph, Compiler } from 'webpack';
import { RuntimeModule, RuntimeGlobals, Template } from 'webpack';
import { getUndoPath } from 'webpack/lib/util/identifier';
import compileBooleanMatcher from 'webpack/lib/util/compileBooleanMatcher';
import DynamicFileSystem from '../filesystem/DynamicFilesystemRuntimeModule';

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
    chunkLoadingContext: ChunkLoadingContext
  ) {
    super('readFile chunk loading', RuntimeModule.STAGE_ATTACH);
    this.runtimeRequirements = runtimeRequirements;

    this.options = options;
    this.chunkLoadingContext = chunkLoadingContext;
  }

  getInitialChunkIds(chunk: Chunk, chunkGraph: ChunkGraph, chunkHasJs: Function) {
    const initialChunkIds = new Set(chunk.ids);
    for (const c of chunk.getAllInitialChunks()) {
      if (c === chunk || chunkHasJs(c, chunkGraph)) continue;
      if (c.ids) {
        for (const id of c.ids) initialChunkIds.add(id);
      }
      for (const c of chunk.getAllAsyncChunks()) {
        if (c === chunk || chunkHasJs(c, chunkGraph)) continue;
        if (c.ids) {
          for (const id of c.ids) initialChunkIds.add(id);
        }
      }
    }
    return initialChunkIds;
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
    const { webpack } = this.chunkLoadingContext;
    const { chunkGraph, chunk, compilation } = this;

    if (!chunkGraph || !chunk || !compilation) return '';

    const { runtimeTemplate } = compilation;

    const jsModulePlugin =
      webpack?.javascript?.JavascriptModulesPlugin ||
      require('webpack/lib/javascript/JavascriptModulesPlugin');

    const chunkHasJs = jsModulePlugin.chunkHasJs;


    const fn = RuntimeGlobals.ensureChunkHandlers;
    const withBaseURI = this.runtimeRequirements.has(RuntimeGlobals.baseURI);
    const withExternalInstallChunk = this.runtimeRequirements.has(
      RuntimeGlobals.externalInstallChunk
    );

    const withOnChunkLoad = this.runtimeRequirements.has(
      RuntimeGlobals.onChunksLoaded
    );
    const withLoading = this.runtimeRequirements.has(
      RuntimeGlobals.ensureChunkHandlers
    );
    const withHmr = this.runtimeRequirements.has(
      RuntimeGlobals.hmrDownloadUpdateHandlers
    );
    const withHmrManifest = this.runtimeRequirements.has(
      RuntimeGlobals.hmrDownloadManifest
    );

    const conditionMap = chunkGraph.getChunkConditionMap(chunk, chunkHasJs);
    const hasJsMatcher = compileBooleanMatcher(conditionMap);
    const initialChunkIds = this.getInitialChunkIds(chunk, chunkGraph, chunkHasJs);

    const outputName = compilation.getPath(
      jsModulePlugin.getChunkFilenameTemplate(chunk, compilation.outputOptions),
      {
        chunk,
        contentHashType: 'javascript',
      }
    );

    const rootOutputDir = getUndoPath(
      outputName,
      compilation.outputOptions.path,
      false
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
          ',\n'
        )
      ),
      '};',
      '',
      withOnChunkLoad
        ? `${
            RuntimeGlobals.onChunksLoaded
          }.readFileVm = ${runtimeTemplate.returningFunction(
            'installedChunks[chunkId] === 0',
            'chunkId'
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
              ]
            )}`,
          ])
        : '// no remote script loader needed',
      withLoading
        ? Template.asString([
            new DynamicFileSystem().generate(),
            `if(!globalThis.__remote_scope__) globalThis.__remote_scope__ = ${RuntimeGlobals.require}.federation`,
            '// Dynamic filesystem chunk loading for javascript',
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
                          'function installChunkCallback(error,chunk){',
                          Template.indent([
                            'if(error) return reject(error);',
                            'installChunk(chunk);',
                          ]),
                          '}',
                          'var fs = typeof process !== "undefined" ? require(\'fs\') : false;',
                          // filename is duplicated in here and in filesystem strategy below
                          `var filename = typeof process !== "undefined" ? require('path').join(__dirname, ${JSON.stringify(
                            rootOutputDir
                          )} + ${
                            RuntimeGlobals.getChunkScriptFilename
                          }(chunkId)) : false;`,
                          'if(fs && fs.existsSync(filename)) {',
                          Template.indent([
                            `loadChunkStrategy('filesystem', chunkId, ${JSON.stringify(
                              rootOutputDir
                            )}, remotes, installChunkCallback);`,
                          ]),
                          '} else { ',
                          Template.indent([
                            // keys are mostly useless here, we want to find remote by its global (unique name)
                            `var remotes = ${JSON.stringify(
                              Object.values(remotes).reduce((acc, remote) => {
                                //TODO: need to handle all other cases like when remote is not a @ syntax string
                                const [global, url] = remote.split('@');
                                acc[global] = url;
                                return acc;
                              }, {} as Record<string, string>)
                            )};`,

                            `var requestedRemote = ${
                              RuntimeGlobals.require
                            }.federation.remotes[${JSON.stringify(name)}]`,

                            /*TODO:
                            need to handle if chunk fetch fails/crashes - ensure server still can keep loading
                            right now if you throw an error in here, server will stall forever
                            */

                            "if(typeof requestedRemote === 'function'){",
                            Template.indent(
                              'requestedRemote = await requestedRemote()'
                            ),
                            '}',

                            this._getLogger(
                              '"requestedRemote"',
                              'requestedRemote',
                              'current name',
                              JSON.stringify(name)
                            ),
                            `var chunkName = ${RuntimeGlobals.getChunkScriptFilename}(chunkId);`,
                            "const loadingStrategy = typeof process !== 'undefined' ?  'http-vm' : 'http-eval';",

                            `loadChunkStrategy(loadingStrategy, chunkName,${JSON.stringify(
                              name
                            )}, globalThis.__remote_scope__.remotes,installChunkCallback);`,
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
                  rootOutputDir
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
              require('webpack/lib/hmr/JavascriptHotModuleReplacement.runtime.js')
            )
              .replace(/\$key\$/g, 'readFileVm')
              .replace(/\$installedChunks\$/g, 'installedChunks')
              .replace(/\$loadUpdateChunk\$/g, 'loadUpdateChunk')
              .replace(/\$moduleCache\$/g, RuntimeGlobals.moduleCache)
              .replace(/\$moduleFactories\$/g, RuntimeGlobals.moduleFactories)
              .replace(
                /\$ensureChunkHandlers\$/g,
                RuntimeGlobals.ensureChunkHandlers
              )
              .replace(/\$hasOwnProperty\$/g, RuntimeGlobals.hasOwnProperty)
              .replace(/\$hmrModuleData\$/g, RuntimeGlobals.hmrModuleData)
              .replace(
                /\$hmrDownloadUpdateHandlers\$/g,
                RuntimeGlobals.hmrDownloadUpdateHandlers
              )
              .replace(
                /\$hmrInvalidateModuleHandlers\$/g,
                RuntimeGlobals.hmrInvalidateModuleHandlers
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
                  rootOutputDir
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
