/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/

'use strict';

const RuntimeGlobals = require('webpack/lib/RuntimeGlobals');
const RuntimeModule = require('webpack/lib/RuntimeModule');
const Template = require('webpack/lib/Template');
const compileBooleanMatcher = require('webpack/lib/util/compileBooleanMatcher');
const { getUndoPath } = require('webpack/lib/util/identifier');

import loadScriptTemplate from './loadScript';

class ReadFileChunkLoadingRuntimeModule extends RuntimeModule {
  constructor(runtimeRequirements, options, context) {
    super('readFile chunk loading', RuntimeModule.STAGE_ATTACH);
    this.runtimeRequirements = runtimeRequirements;
    this.options = options;
    this.context = context;
  }

  /**
   * @private
   * @param {Chunk} chunk chunk
   * @param {string} rootOutputDir root output directory
   * @returns {string} generated code
   */
  _generateBaseUri(chunk, rootOutputDir) {
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
   * @returns {string} runtime code
   */
  generate() {
    // name in this context is always the current remote itself.
    // this code below is in each webpack runtime, host and remotes
    // remote entries handle their own loading of chunks, so i have fractal self awareness
    // hosts will likely never run the http chunk loading runtime, they use fs.readFile
    // remotes only use fs.readFile if we were to cache the chunks on disk after fetching - otherwise its always using http
    // so for example, if im in hostA and require(remoteb/module) --> console.log of name in runtime code will return remoteb

    const { baseURI, promiseBaseURI, remotes, name } = this.options;
    const { webpack } = this.context;
    const chunkHasJs =
      (webpack && webpack.javascript.JavascriptModulesPlugin.chunkHasJs) ||
      require('webpack/lib/javascript/JavascriptModulesPlugin').chunkHasJs;

    // workaround for next.js
    const getInitialChunkIds = (chunk, chunkGraph) => {
      const initialChunkIds = new Set(chunk.ids);
      for (const c of chunk.getAllInitialChunks()) {
        if (c === chunk || chunkHasJs(c, chunkGraph)) continue;
        for (const id of c.ids) initialChunkIds.add(id);
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
    const initialChunkIds = getInitialChunkIds(chunk, chunkGraph, chunkHasJs);

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
                          Template.indent([
                            loadScriptTemplate,

                            `console.log('needs to load remote module from', ${JSON.stringify(
                              name
                            )});`,
                            `console.log('remotes known to', ${JSON.stringify(
                              name
                            )}, ${JSON.stringify(remotes)})`,
                            // keys are mostly useless here, we want to find remote by its global (unique name)
                            `var remotes = ${JSON.stringify(
                              Object.values(remotes).reduce((acc, remote) => {
                                //TODO: need to handle all other cases like when remote is not a @ syntax string
                                const [global, url] = remote.split('@');
                                acc[global] = url;
                                return acc;
                              }, {})
                            )};`,
                            /* TODO: keying by global should be ok, but need to verify - need to deal with when user passes promise new promise()
    global will/should still exist - but can only be known at runtime */
                            `console.log('remotes keyed by global name',remotes)`,

                            `console.log('global.__remote_scope__',global.__remote_scope__)`,
                            `console.log('global.__remote_scope__[${JSON.stringify(
                              name
                            )}]',global.__remote_scope__[${JSON.stringify(
                              name
                            )}])`,

                            `if(global.REMOTE_CONFIG && !global.REMOTE_CONFIG[${JSON.stringify(
                              name
                            )}]) {
                  if(global.loadedRemotes){
                    for (const property in global.loadedRemotes) {
                      global.REMOTE_CONFIG[property] = global.loadedRemotes[property].path
                    }
                  }`,
                            Template.indent([
                              `Object.assign(global.REMOTE_CONFIG, remotes)`,
                            ]),
                            '}',
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
                            "console.log('about to derive remote making request')",
                            /*TODO: remotes variable will not work in many cases for looking up remotes own url, see note above
                                    this only works becuase the demo lists all remotes and all remotes happen to be same url and version */
                            `var requestedRemote = remotes[${JSON.stringify(
                              name
                            )}]`,
                            "console.log('requested remote', requestedRemote)",
                            /*TODO: we need to support when user implements own promise new promise function
                                    for example i have my own promise remotes, not global@remotename
                                    so there could be cases where remote may be function still - not sure */

                            /*TODO: need to handle if chunk fetch fails/crashes - ensure server still can keep loading
                                    right now if you throw an error in here, server will stall forever */

                            `if(typeof requestedRemote === 'function'){
                    requestedRemote = await requestedRemote()
                  }`,
                            `console.log('var requestedRemote',requestedRemote);`,

                            // example: uncomment this and server will never reply
                            // `var scriptUrl = new URL(requestedRemote.split("@")[1]);`,
                            // since im looping over remote and creating global at build time, i dont need to split string at runtime
                            // there may still be a use case for that with promise new promise, depending on how we design it.
                            `var scriptUrl = new URL(requestedRemote);`,

                            `var chunkName = ${RuntimeGlobals.getChunkScriptFilename}(chunkId);`,

                            // `console.log('remotes global',global.REMOTE_CONFIG);`,

                            `console.log('chunkname to request',chunkName);`,
                            `var fileToReplace = require('path').basename(scriptUrl.pathname);`,
                            `scriptUrl.pathname = scriptUrl.pathname.replace(fileToReplace, chunkName);`,
                            `console.log('will load remote chunk', scriptUrl.toString());`,
                            `loadScript(scriptUrl.toString(), function(err, content) {`,
                            Template.indent([
                              "console.log('load script callback fired')",
                              "if(err) {console.error('error loading remote chunk', scriptUrl.toString(),'got',content); return reject(err);}",
                              'var chunk = {};',
                              'try {',
                              "require('vm').runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\\n})', filename)" +
                                "(chunk, require, require('path').dirname(filename), filename);",
                              '} catch (e) {',
                              "console.log('runInThisContext thew', e)",
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
              require('../hmr/JavascriptHotModuleReplacement.runtime.js')
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

    const temp = Template.asString([
      withBaseURI
        ? Template.asString([
            `${RuntimeGlobals.baseURI} = require("url").pathToFileURL(${
              rootOutputDir
                ? `__dirname + ${JSON.stringify('/' + rootOutputDir)}`
                : '__filename'
            });`,
          ])
        : '// no baseURI',
      '',
      '// object to store loaded chunks',
      '// "0" means "already loaded", Promise means loading',
      'var installedChunks = {',
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
                          `var fs = require('fs');
                if(fs.existsSync(filename)) {
                  fs.readFile(filename, 'utf-8', function(err, content) {`,
                          Template.indent([
                            'if(err) { return reject(err);}',

                            'var chunk = {};',

                            "require('vm').runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\\\\n})', filename)" +
                              "(chunk, require, require('path').dirname(filename), filename);",
                            `console.log('chunk installed', chunk);`,
                            'installChunk(chunk);',
                          ]),
                          '});',
                          `} else {`,

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
              require('../hmr/JavascriptHotModuleReplacement.runtime.js')
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

    return temp;
  }
}

export default ReadFileChunkLoadingRuntimeModule;
