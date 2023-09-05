/*
  MIT License http://www.opensource.org/licenses/mit-license.php
*/
import type { Chunk, ChunkGraph, Compiler } from 'webpack';
import { RuntimeModule, RuntimeGlobals, Template } from 'webpack';
import { getUndoPath } from 'webpack/lib/util/identifier';
import compileBooleanMatcher from 'webpack/lib/util/compileBooleanMatcher';
import DynamicFileSystem from '../filesystem/DynamicFilesystemRuntimeModule';
import {generateHmrCode,getInitialChunkIds} from  './parts'

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
   handleOnChunkLoad(withOnChunkLoad: boolean, runtimeTemplate: any): string {
    if (withOnChunkLoad) {
      return `${
        RuntimeGlobals.onChunksLoaded
      }.readFileVm = ${runtimeTemplate.returningFunction(
        'installedChunks[chunkId] === 0',
        'chunkId'
      )};`
    } else {
      return '// no on chunks loaded';
    }
  }


  generateInstallChunk(runtimeTemplate: any, withOnChunkLoad: boolean): string {
    return `var installChunk = ${runtimeTemplate.basicFunction('chunk', [
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
    ])};`;

}

  /**
   * Generates the load script equivalent for server side.
   * @param {any} runtimeTemplate - The runtime template.
   * @returns {string} - The generated script.
   */
  generateLoadScript(runtimeTemplate: any): string {
    return Template.asString([
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
    ]);
  }

  generateLoadingCode(withLoading: boolean, fn: string, hasJsMatcher: any, rootOutputDir: string, remotes: Record<string, string>, name: string | undefined): string {
    if (!withLoading) {
      return '// no chunk loading';
    }

    return Template.asString([
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
    ]);
  }
  generateExternalInstallChunkCode(withExternalInstallChunk: boolean): string {
    if (!withExternalInstallChunk) {
      return '// no external install chunk';
    }

    return Template.asString([
      'module.exports = __webpack_require__;',
      `${RuntimeGlobals.externalInstallChunk} = function(){`,
      this.options.debug
        ? `console.debug('node: webpack installing to install chunk id:', arguments['0'].id);`
        : '',
      `return installChunk.apply(this, arguments)};`,
    ]);
  }

  generateHmrManifestCode(withHmrManifest: boolean, rootOutputDir: string): string {
    if (!withHmrManifest) {
      return '// no HMR manifest';
    }

    return Template.asString([
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
    ]);
  }

  /**
   * @returns {string} runtime code
   */
  override generate() {
    const { remotes = {}, name } = this.options;
    const { webpack } = this.chunkLoadingContext;
    const { chunkGraph, chunk, compilation } = this;

    if (!chunkGraph || !chunk || !compilation) return '';

    const { runtimeTemplate } = compilation;
    const jsModulePlugin = webpack?.javascript?.JavascriptModulesPlugin || require('webpack/lib/javascript/JavascriptModulesPlugin');
    const chunkHasJs = jsModulePlugin.chunkHasJs;
    const fn = RuntimeGlobals.ensureChunkHandlers;

    const conditionMap = chunkGraph.getChunkConditionMap(chunk, chunkHasJs);
    const hasJsMatcher = compileBooleanMatcher(conditionMap);
    const initialChunkIds = getInitialChunkIds(chunk, chunkGraph, chunkHasJs);

    const outputName = compilation.getPath(jsModulePlugin.getChunkFilenameTemplate(chunk, compilation.outputOptions), { chunk, contentHashType: 'javascript' });
    const rootOutputDir = getUndoPath(outputName, compilation.outputOptions.path, false);
    const stateExpression = this.runtimeRequirements.has(RuntimeGlobals.hmrDownloadUpdateHandlers) ? `${RuntimeGlobals.hmrRuntimeStatePrefix}_readFileVm` : undefined;

    return Template.asString([
      this.runtimeRequirements.has(RuntimeGlobals.baseURI) ? this._generateBaseUri(chunk, rootOutputDir) : '// no baseURI',
      '',
      '// object to store loaded chunks',
      '// "0" means "already loaded", Promise means loading',
      `var installedChunks = ${stateExpression ? `${stateExpression} = ${stateExpression} || ` : ''}{`,
      Template.indent(Array.from(initialChunkIds, (id) => `${JSON.stringify(id)}: 0`).join(',\n')),
      '};',
      '',
      this.handleOnChunkLoad(this.runtimeRequirements.has(RuntimeGlobals.onChunksLoaded), runtimeTemplate),
      '',
      this.generateInstallChunk(runtimeTemplate, this.runtimeRequirements.has(RuntimeGlobals.onChunksLoaded)),
      '',
      this.runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers) ? this.generateLoadScript(runtimeTemplate) : '// no remote script loader needed',
      this.runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers) ? this.generateLoadingCode(this.runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers), fn, hasJsMatcher, rootOutputDir, remotes, name) : '// no chunk loading',
      '',
      this.generateExternalInstallChunkCode(this.runtimeRequirements.has(RuntimeGlobals.externalInstallChunk)),
      '',
      generateHmrCode(this.runtimeRequirements.has(RuntimeGlobals.hmrDownloadUpdateHandlers), rootOutputDir),
      '',
      this.generateHmrManifestCode(this.runtimeRequirements.has(RuntimeGlobals.hmrDownloadManifest), rootOutputDir),
    ]);
  }
}

export default ReadFileChunkLoadingRuntimeModule;


