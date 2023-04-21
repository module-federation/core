/* eslint-disable @typescript-eslint/no-var-requires */
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
*/

'use strict';

import type { Chunk, ChunkGraph, Compiler } from 'webpack';
import { RuntimeGlobals, RuntimeModule, Template } from 'webpack';
//@ts-ignore
import { getUndoPath } from 'webpack/lib/util/identifier';
//@ts-ignore
import compileBooleanMatcher from 'webpack/lib/util/compileBooleanMatcher';

// import loadScriptTemplate, { executeLoadTemplate } from './loadScript';

interface RemotesByType {
  functional: string[];
  normal: string[];
}

interface ReadFileChunkLoadingRuntimeModuleOptions {
  baseURI: Compiler['options']['output']['publicPath'];
  promiseBaseURI?: string;
  remotes: Record<string, string>;
  name?: string;
  verbose?: boolean;
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
    if (!this.options.verbose) {
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
      { functional: [], normal: [] }
    );

    const { webpack } = this.chunkLoadingContext;
    const chunkHasJs =
      (webpack && webpack.javascript.JavascriptModulesPlugin.chunkHasJs) ||
      require('webpack/lib/javascript/JavascriptModulesPlugin').chunkHasJs;

    // workaround for next.js
    const getInitialChunkIds = (chunk: Chunk, chunkGraph: ChunkGraph) => {
      const initialChunkIds = new Set(chunk.ids);
      for (const c of chunk.getAllInitialChunks()) {
        if (c === chunk || chunkHasJs(c, chunkGraph)) continue;
        if (c.ids) {
          for (const id of c.ids) initialChunkIds.add(id);
        }
      }
      return initialChunkIds;
    };

    const { chunkGraph, chunk } = this;
    const { runtimeTemplate } = this.compilation;
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
    const initialChunkIds = getInitialChunkIds(chunk, chunkGraph); // , chunkHasJs);
    const ccm = chunkGraph.getChunkModules(chunk);
    // check if module type is in chunk
    if (chunk.name !== 'webpack') return Template.asString('');
    const containerEntry = ccm
      .filter((module) => {
        return module.constructor.name === 'ContainerEntryModule';
      })
      .map((module) => {
        return `
        try {
        console.log('should set from host', document.currentScript.src);
        window[${JSON.stringify(
          //@ts-ignore
          module._name || name
        )}] = __webpack_require__(${JSON.stringify(
          module?.id || module?.debugId
        )})
        } catch (e) {
          console.error('host runtime was unable to initialize its own remote',e);
        }`;
      });
    if (containerEntry) {
      console.log(
        'found container entry module for inverse boot',
        containerEntry
      );
    }
    return Template.asString(containerEntry);

    const outputName = this.compilation.getPath(
      (
        (webpack &&
          webpack.javascript.JavascriptModulesPlugin
            .getChunkFilenameTemplate) ||
        require('webpack/lib/javascript/JavascriptModulesPlugin')
          .getChunkFilenameTemplate
      )(chunk, this.compilation.outputOptions),
      {
        chunk,
        contentHashType: 'javascript',
      }
    );
    const rootOutputDir = getUndoPath(
      outputName,
      this.compilation.outputOptions.path,
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
                  'if(!global.__remote_scope__) {',
                  Template.indent([
                    '// create a global scope for container, similar to how remotes are set on window in the browser',
                    'global.__remote_scope__ = {',
                    '_config: {},',
                    '}',
                  ]),
                  '}',
                ]),
                // Template.indent([
                //   executeLoadTemplate,
                //   `executeLoad(url,callback,chunkId)`,
                // ]),
              ]
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
                          `var filename = require('path').join(__dirname, ${JSON.stringify(
                            rootOutputDir
                          )} + ${
                            RuntimeGlobals.getChunkScriptFilename
                          }(chunkId));`,
                          "var fs = require('fs');",
                          'if(fs.existsSync(filename)) {',
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
            `${RuntimeGlobals.externalInstallChunk} = installChunk;`,
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
